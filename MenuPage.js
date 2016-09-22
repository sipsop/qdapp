// TODO: Enable flow type checking

import React, { Component } from 'react'
import {
    Image,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'


// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { HOST } from './HTTP.js'
import { Page } from './Page.js'
import { LazyComponent, lazyWrap } from './LazyComponent.js'
import { createOrderItem, orderStore } from './Orders/OrderStore.js'
import { OrderList } from './Orders/OrderList.js'
import { BarPageFetcher } from './Bar/BarPage.js'
import { PureComponent } from './Component.js'
import { T } from './AppText.js'
import { Price, sumPrices } from './Price.js'
import { SizeTracker } from './SizeTracker.js'
import { PickerCollection, PickerItem } from './Pickers.js'
import { LargeButton } from './Button.js'
import { TagView } from './Tags.js'
import { FavItemContainer } from './Fav.js'
import * as _ from './Curry.js'
import { store, tabStore } from './Store.js'
import { tagStore } from './Tags.js'
import { size } from './Size.js'
import { config } from './Config.js'

/*********************************************************************/

import type { Int, String } from '../Types.js'
import type { OrderItem } from './Orders/OrderStore.js'

/*********************************************************************/

const { log, assert } = _.utils('MenuPage.js')

@observer
export class MenuPage extends BarPageFetcher {
    renderFinished = (bar) => <MenuView />
}

@observer
export class MenuView extends Page {
    renderView = () => {
        return <View style={{flex: 1}}>
            <View style={{flex: 1, marginTop: 5}}>
                {/*
                    NOTE: Pass a key to OrderList to ensure it does not
                          reuse state. This has the effect of "reloading"
                          the entire listview. Otherwise, if the user has
                          scrolled down say 100 items, then switching from
                          e.g. wine to beer will render 100 beer items, even
                          though only a few are visible.
                */}
                <OrderList
                    key={tagStore.tagSelection.join(';')}
                    orderStore={orderStore}
                    menuItems={tagStore.activeMenuItems}
                    renderHeader={() => <TagView />}
                    />
            </View>
            <OrderButton />
        </View>
    }
}

@observer
class OrderButton extends PureComponent {
    render = () => {
        if (orderStore.menuItemsOnOrder.length === 0) {
            return <View />
        }
        return <LargeButton
                    label={`Review`}
                    onPress={() => tabStore.setCurrentTab(3)}
                    style={{margin: 5, height: rowHeight}}
                    /*
                    prominent={false}
                    backgroundColor={config.theme.secondary.dark}
                    borderColor={config.theme.secondary.medium}
                    */
                    />
    }
}

@observer
export class MenuItem extends PureComponent {
    /* properties:
        rowNumber: Int
        menuItem: MenuItem
        orderStore: OrderStore
    */

    @observable showModalFor : ?OrderItem = null

    @action showModal = () => {
        const orderItem = createOrderItem(this.props.menuItem)
        this.props.orderStore.addOrderItem(orderItem)
        this.showModalFor = orderItem
    }

    @action modalClosed = () => {
        this.showModalFor = null
    }

    @computed get haveOrderItems() : Array<OrderItem> {
        return this.props.orderStore.getOrderList(this.props.menuItem.id).length > 0
    }

    render = () => {
        const menuItem = this.props.menuItem
        const isEven = this.props.rowNumber % 2 === 0
        const backgroundColor = isEven
            ? '#fff'
            : config.theme.menuItemBackgroundColor
        const marginBottom = this.haveOrderItems ? 10 : 0
        return <View style={{/*marginBottom: marginBottom*/}}>
            <View style={{backgroundColor: backgroundColor}}>
                <TouchableOpacity onPress={this.showModal}>
                    <View style={styles.primaryMenuItemView}>
                        <MenuItemImage menuItem={menuItem} />
                        <View style={viewStyles.content}>
                            <MenuItemHeader menuItem={menuItem} />
                        </View>
                    </View>
                </TouchableOpacity>
                <MenuItemOrderList
                    menuItem={menuItem}
                    showModalFor={this.showModalFor}
                    onModalClose={this.modalClosed}
                    orderStore={this.props.orderStore}
                    />
            </View>
            <View style={{backgroundColor: '#fff', height: marginBottom}} />
        </View>
    }
}

const getImageURL = (menuItem : MenuItem) => {
    if (!menuItem.images || menuItem.images.length === 0)
        return undefined
    const url = menuItem.images[0]
    if (url.startsWith('/static'))
        return HOST + url
    return url
}

export class MenuItemImage extends PureComponent {
    /* properties:
        menuItem: MenuItem
        style: style object
    */

    render = () => {
        const style = this.props.style || styles.image
        const menuItem = this.props.menuItem
        const image = getImageURL(menuItem)
        return <Image source={{uri: image}} style={style} />
    }
}

@observer
class MenuItemOrderList extends PureComponent {
    /* properties:
        menuItem: MenuItem
        showModalFor: ?OrderItem
            order item that we should show a modal for (just once)
        onModalClose: () => void
        orderStore: OrderStore
    */

    @computed get orderItems() : Array<OrderItem> {
        return this.props.orderStore.getOrderList(this.props.menuItem.id)
    }

    render = () => {
        const rowStyle =
            { flex: 1
            , justifyContent: 'center'
            , alignItems: 'center'
            , height: rowHeight
            }

        const buttonStyle =
            { borderRadius: 5
            , borderWidth: 1
            , marginLeft: 5
            , marginRight: 5
            }

        return <View>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    {
                        this.orderItems.map(this.renderOrderItem)
                    }
                </View>
                <PriceColumn
                    orderItems={this.orderItems}
                    orderStore={this.props.orderStore}
                    />
            </View>
        </View>
    }

    renderOrderItem = (orderItem : OrderItem, i : Int) : Component => {
        const showModal = this.props.showModalFor
            ? orderItem.id === this.props.showModalFor.id
            : false

        return <OrderSelection
                    key={orderItem.id}
                    rowNumber={i}
                    menuItem={this.props.menuItem}
                    orderStore={this.props.orderStore}
                    orderItem={orderItem}
                    showModal={showModal}
                    onModalClose={this.props.onModalClose}
                    />
    }
}

@observer
export class PriceColumn extends PureComponent {
    /* properties:
        orderItems: [OrderItem]
        orderStore: OrderStore
    */
    render = () => {
        return <View style={{minWidth: 60}}>
            {
                this.props.orderItems.map((orderItem, i) =>
                    <PriceEntry
                        key={orderItem.id}
                        rowNumber={i}
                        orderItem={orderItem}
                        orderStore={this.props.orderStore}
                        />
                )
            }
        </View>
    }
}

@observer
class PriceEntry extends PureComponent {
    /* properties:
        orderItem: OrderItem
        rowNumber: Int
        orderStore: OrderStore
    */
    render = () => {
        const total = this.props.orderStore.getTotal(this.props.orderItem)
        log("re-rendering price for orderItem", this.props.rowNumber)
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <T style={{marginRight: 5, color: '#000'}}>
                    {orderStore.formatPrice(total)}
                </T>
            </View>
        )
    }
}

@observer
class MenuItemHeader extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
    */
    render = () => {
        const menuItem = this.props.menuItem
        return <View style={viewStyles.header}>
            <View style={viewStyles.titleAndPrice}>
                <T
                    lineBreakMode='tail'
                    numberOfLines={1}
                    style={styles.titleText}
                    >
                    {menuItem.name}
                </T>
                <Price price={menuItem.price} style={styles.priceText} />
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <T style={styles.keywordText}>
                        {
                            menuItem.tags
                                .filter(tagStore.tagIsDefined)
                                .map(tagStore.getTagName)
                                .join(' ')
                        }
                    </T>
                    <T style={styles.infoText} numberOfLines={3}>
                        {menuItem.desc}
                    </T>
                </View>
                <FavItemContainer menuItemID={this.props.menuItem.id} style={viewStyles.favIcon} iconSize={45} />
            </View>
        </View>
    }
}


const viewStyles = {
    content: {
        flex:           1,
        flexWrap: 'wrap',
        // marginTop:      5,
        marginLeft:     5,
        marginRight:    5,
    },
    header: {
        flex: 0,
        justifyContent: 'space-around',
        alignItems: 'flex-start'
    },
    titleAndPrice: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    favIcon: {
        flex: 0,
        width: 50,
        height: 50,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
}

const styles = {
    primaryMenuItemView: {
        flex:           0,
        flexDirection:  'row',
        justifyContent: 'flex-start',
        // alignItems:     'flex-start',
        alignItems:     'flex-start',
        // minHeight:      120,
    },
    image: {
        /*
        flex: 1,
        width: undefined,
        height: undefined,
        */
        // minWidth: 100,
        // minHeight: 100,
        width:  100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    titleScrollView: {
        marginRight: 10,
    },
    titleText: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textDecorationLine: 'underline',
        marginRight: 5,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.8)'
    },
    keywordText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.50)',
    },
}

const N = 50
const rowHeight = 55
const buttonHeight = 45
const iconBoxSize = 60
const iconSize = iconBoxSize

@observer
export class OrderSelection extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        orderItem: schema.OrderItem
        onModalClose: () => void
        rowNumber: int
        removeRow() -> void
            remove this row
    */

    get orderItem() {
        return this.props.orderItem
    }

    @computed get amountPickerItem() {
        // log("recomputing amountPickerItem", this.props.rowNumber)
        const subTotal = this.props.orderStore.getSubTotal(this.orderItem) || 0.0
        const numbers = _.range(N+1)
        return new PickerItem(
            "Number of Drinks:",
            numbers.map(i => "" + i),
            numbers.map(i => this.makeAbsPrice(i * subTotal)),
            -1,                             /* defaultOption */
            [this.orderItem.amount],             /* selection */
            'Single',                       /* optionType */
        )
    }

    @computed get optionPickerItems() {
        // log("recomputing optionPickerItems", this.props.rowNumber)
        const menuItem = this.props.menuItem
        return menuItem.options.map((menuItemOption, i) => {
            /* Use the name of the menu item for the first option (e.g. 'Guiness') */
            const name = i === 0 ? menuItem.name : menuItemOption.name
            const selectedOptions = this.orderItem.selectedOptions[i]
            const selectedIntOptions = selectedOptions.map(
                stringOption => _.find(menuItemOption.optionList, stringOption)
            )
            return new PickerItem(
                name,
                menuItemOption.optionList,
                menuItemOption.prices,
                menuItemOption.defaultOption || -1,
                selectedIntOptions,
                menuItemOption.optionType,
            )
        })
    }

    makeAbsPrice = (price) => {
        return {
            price: price,
            option: 'Absolute',
            currency: this.props.orderStore.currency,
        }
    }

    @action handleIncrease = () => {
        this.orderItem.amount = _.min(N, this.orderItem.amount + 1)
    }

    @action handleDecrease = () => {
        if (this.orderItem.amount === 0)
            this.props.orderStore.removeOrderItem(this.orderItem)
        else
            this.orderItem.amount = _.max(0, this.orderItem.amount - 1)
    }

    handleClose = () => {
        this.props.onModalClose()
    }

    @action handleAcceptAmountChanges = (allSelectedOptions : [[number]]) => {
        const amountSelection : [number] = allSelectedOptions[0]
        this.orderItem.amount = amountSelection[0]
        this.handleClose()
    }

    @action handleAcceptOptions = (allSelectedOptions : [[Int]]) => {
        const menuItem = this.props.menuItem
        const stringOptions = allSelectedOptions.map(
            (options, i) => options.map(
                intOption => menuItem.options[i].optionList[intOption]
            )
        )
        this.orderItem.selectedOptions = stringOptions
        this.handleClose()
    }

    @action handleFirstAccept = () => {
        // this.orderItem.showModal = false
        this.handleClose()
    }

    @action handleFirstCancel = () => {
        // this.orderItem.showModal = false
        this.props.orderStore.removeOrderItem(this.orderItem)
        this.handleClose()
    }

    get showModal() {
        return this.props.showModal
    }

    renderHeader = () => {
        const url = getImageURL(this.props.menuItem)
        // return <View style={{height: 200, backgroundColor: '#000'}} />
        if (!url)
            return <View />

        return <LazyComponent style={{height: 200}}>
            <Image
                key={url}
                source={{uri: url}}
                style={{height: 200}}
                />
        </LazyComponent>
    }

    render = () => {
        log("re-rendering OrderItem", this.props.rowNumber)
        return <View style={
                    { flex: 0
                    , flexDirection: 'row'
                    , justifyContent: 'flex-start'
                    , alignItems: 'center'
                    , height: rowHeight
                    }
                }   >
            <View style={{flex: 2, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={this.optionPickerItems}
                    onAcceptChanges={this.handleAcceptOptions}
                    rowNumber={this.props.rowNumber}
                    showModal={this.showModal}
                    onFirstAccept={this.handleFirstAccept}
                    onFirstCancel={this.handleFirstCancel}
                    okLabel={this.showModal ? 'Add' : 'Change'}
                    showOkButton={true}
                    renderHeader={this.renderHeader}
                    />
            </View>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, height: iconBoxSize, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}>
                {/*<Icon name="minus-circle" size={iconSize} color="#900" />*/}
                <EvilIcon name="minus" size={iconSize} color={config.theme.removeColor} />
            </TouchableOpacity>
            <View style={{flex: 1, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={[this.amountPickerItem]}
                    onAcceptChanges={this.handleAcceptAmountChanges}
                    rowNumber={this.props.rowNumber}
                    useListView={true}
                    showOkButton={false}
                    />
            </View>
            <TouchableOpacity
                    onPress={this.handleIncrease}
                    style={{flex: 0, width: iconBoxSize, height: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}
                    >
                {/*<Icon name="plus-circle" size={iconSize} color="rgb(51, 162, 37)" />*/}
                <EvilIcon name="plus" size={iconSize} color={config.theme.addColor} />
            </TouchableOpacity>
         </View>
    }
}
