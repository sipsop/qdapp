/* @flow */

import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  ListView,
  Picker,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { Page } from './Page.js'
import { OrderItem } from './Orders.js'
import { BarPageFetcher } from './BarPage.js'
import { PureComponent } from './Component.js'
import { T } from './AppText.js'
import { Price, sumPrices } from './Price.js'
import { DownloadResultView } from './HTTP.js'
import { SizeTracker } from './SizeTracker.js'
import { PickerCollection, PickerItem } from './Pickers.js'
import { LargeButton } from './Button.js'
import { TagView } from './Tags.js'
import { FavItemContainer } from './Fav.js'
import { min, max } from './Curry.js'
import { store, tabStore } from './Store.js'
import { tagStore } from './Tags.js'
import { size } from './Size.js'
import { config } from './Config.js'

@observer
export class MenuPage extends BarPageFetcher {
    renderFinished = (bar) => <MenuView />
}

@observer
export class MenuView extends Page {
    render = () => {
        return <View style={{flex: 1}}>
            <ScrollView style={{flex: 1}}>
                <TagView>
                    <View style={{flex: 1, marginTop: 5}}>
                        {
                            tagStore.getActiveMenuItems().map(
                                menuItem =>
                                    <MenuItem
                                        key={menuItem.id}
                                        menuItem={menuItem}
                                        currentPage={2}
                                        />
                            )
                        }
                    </View>
                </TagView>
            </ScrollView>
            <OrderButton />
        </View>
    }
}

@observer
class OrderButton extends PureComponent {
    render = () => {
        if (store.menuItemsOnOrder.length === 0) {
            return <View />
        }
        return <LargeButton
                    label="Review Order"
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

const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

@observer
export class MenuItem extends PureComponent {
    /* properties:
        menuItem: scheme.MenuItem
        currentPage: Int
            current page in the TabView
    */

    constructor(props) {
        super(props)
        this.defaultOrderItem = new OrderItem(props.menuItem)
        this.orderItems = store.getOrderList(this.props.menuItem.id)
    }

    hasDefaultOptions = (orderItem) => {
        return this.hasSameOptions(this.defaultOrderItem, orderItem)
    }

    hasSameOptions = (orderItem1, orderItem2) => {
        const options1 = orderItem1.selectedOptions.map(xs => xs.map(x => x))
        const options2 = orderItem2.selectedOptions.map(xs => xs.map(x => x))
        return _.isEqual(options1, options2)
    }

    getDefaultOrderItem = () : OrderItem => new OrderItem(this.props.menuItem)

    addRow = () : void => {
        console.log("pushing new row...")
        this.orderItems.push(this.getDefaultOrderItem())
    }

    removeRow = (i : number) : void => {
         this.orderItems.splice(i, 1)
    }

    /* If row `i` has the same options as row `j`, remove row `i`. */
    removeRowIfSameOptions = (i : number, j : number) : void => {
        if (this.orderItems.length > 1 &&
                this.hasSameOptions(this.orderItems[i], this.orderItems[j]))
            this.orderItems.splice(i, 1)
    }

    popRow = () : void => {
        this.orderItems.pop()
    }

    render = () => {
        const menuItem = this.props.menuItem
        const image = menuItem.images[0]

        return <View>
            <TouchableOpacity onPress={this.addRow}>
                <View style={styles.primaryMenuItemView}>
                    <Image source={{uri: image}} style={styles.image} />
                    <View style={viewStyles.content}>
                        <MenuItemHeader menuItem={menuItem} />
                    </View>
                </View>
            </TouchableOpacity>
            <OrderList
                    menuItem={menuItem}
                    orderItems={this.orderItems}
                    addRow={this.addRow}
                    removeRow={this.removeRow}
                    removeRowIfSameOptions={this.removeRowIfSameOptions}
                    currentPage={this.props.currentPage}
                    />
        </View>
    }
}

@observer
class OrderList extends PureComponent {
    /* properties:
        menuItem: MenuItem
        orderItems: [OrderItem]
        addRow() -> void
        removeRow(i) -> void
        removeRowIfSameOptions(i, j) -> void
        currentPage: Int
            current page in the TabView
    */

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
                        this.props.orderItems.map((orderItem, i) => {
                            return <OrderSelection
                                        key={orderItem.id}
                                        rowNumber={i}
                                        menuItem={this.props.menuItem}
                                        orderItem={orderItem}
                                        removeRow={() => this.props.removeRow(i)}
                                        removeRowIfSameOptions={() => this.props.removeRowIfSameOptions(i, i-1)}
                                        currentPage={this.props.currentPage}
                                        />
                        })
                    }
                </View>
                <PriceColumn orderItems={this.props.orderItems} />
            </View>
            {
                this.props.orderItems.length === 0
                    ? undefined
                    : <View style={{marginBottom: 20}} />

                /*
                    : <View style={[rowStyle, {flexDirection: 'row', marginBottom: 30}]}>
                        {
                        // <TouchableOpacity style={{flex: 1}} onPress={this.popRow}>
                        //     <View style={[rowStyle, buttonStyle, {borderColor: RemoveColor}]}>
                        //         <T style={{fontSize: 20, color: RemoveColor}}>
                        //             REMOVE ROW
                        //         </T>
                        //     </View>
                        // </TouchableOpacity>
                        }
                        <TouchableOpacity style={{flex: 1}} onPress={this.props.addRow}>
                            <View style={[rowStyle, buttonStyle, {borderColor: AddColor}]}>
                                <T style={{fontSize: 20, color: AddColor}}>
                                    MORE OPTIONS
                                </T>
                            </View>
                        </TouchableOpacity>
                    </View>
                */
            }
        </View>
    }
}

@observer
class PriceColumn extends PureComponent {
    /* properties:
        orderItems: [OrderItem]
    */
    render = () => {
        return <View style={{minWidth: 60}}>
            {
                this.props.orderItems.map((orderItem, i) =>
                    <PriceEntry key={orderItem.id} rowNumber={i} orderItem={orderItem} />
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
    */
    render = () => {
        console.log("re-rendering price for orderItem", this.props.rowNumber)
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <T style={{marginRight: 5, color: '#000'}}>
                    {'£' + this.props.orderItem.total.toFixed(2)}
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
                        {   _.join(
                                menuItem.tags.map(tagID => '#' + tagStore.getTagName(tagID)),
                                ' '
                            )
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
const RemoveColor = '#900'
const AddColor = 'rgb(51, 162, 37)'

// spy(console.log)

@observer
export class OrderSelection extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        orderItem: schema.OrderItem
        rowNumber: int
        removeRow() -> void
            remove this row
        removeRowIfSameOptions() -> void
            remove the row iff it has the same options as the item before it
    */

    get orderItem() {
        return this.props.orderItem
    }

    @computed get amountPickerItem() {
        console.log("recomputing amountPickerItem", this.props.rowNumber)
        const subTotal = this.orderItem.subTotal || 0.0
        return new PickerItem(
            "Number of Drinks:",
            _.range(N+1).map(i => "" + i),
            _.range(N+1).map(i => this.makeAbsPrice(i * subTotal)),
            -1,                             /* defaultOption */
            [this.orderItem.amount],             /* selection */
            'Single',                       /* optionType */
        )
    }

    @computed get optionPickerItems() {
        console.log("recomputing optionPickerItems", this.props.rowNumber)
        const menuItem = this.props.menuItem
        return menuItem.options.map((menuOptionItem, i) => {
            return new PickerItem(
                menuOptionItem.name,
                menuOptionItem.optionList,
                menuOptionItem.prices,
                menuOptionItem.defaultOption || -1,
                this.orderItem.selectedOptions[i].slice(), // NOTE: THe copy here is very important!
                menuOptionItem.optionType,
            )
        })
    }

    makeAbsPrice = (price) => {
        return {
            price: price,
            option: 'Absolute',
            currency: this.orderItem.currency,
        }
    }

    @action handleIncrease = () => {
        this.orderItem.amount = min(N, this.orderItem.amount + 1)
    }

    @action handleDecrease = () => {
        if (this.orderItem.amount === 0)
            this.props.removeRow()
        else
            this.orderItem.amount = max(0, this.orderItem.amount - 1)
    }

    @action handleAcceptAmountChanges = (allSelectedOptions : [[number]]) => {
        const amountSelection : [number] = allSelectedOptions[0]
        this.orderItem.amount = amountSelection[0]
    }

    @action handleAcceptOptions = (allSelectedOptions : [[number]]) => {
        this.orderItem.selectedOptions = allSelectedOptions
    }

    @action handleFirstAccept = () => {
        this.orderItem.showModal = false
        // this.props.removeRowIfSameOptions()
    }

    @action handleFirstCancel = () => {
        this.orderItem.showModal = false
        this.props.removeRow()
    }

    get showModal() {
        return tabStore.currentPage === this.props.currentPage && this.orderItem.showModal
    }

    render = () => {
        console.log("re-rendering OrderItem", this.props.rowNumber)
        return <View style={
                    { flex: 0
                    , flexDirection: 'row'
                    , justifyContent: 'flex-start'
                    , alignItems: 'center'
                    , height: rowHeight
                    }
                }>
            <View style={{flex: 2, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={this.optionPickerItems}
                    onAcceptChanges={this.handleAcceptOptions}
                    rowNumber={this.props.rowNumber}
                    showModal={this.showModal}
                    onFirstAccept={this.handleFirstAccept}
                    onFirstCancel={this.handleFirstCancel}
                    />
            </View>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, height: iconBoxSize, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}>
                {/*<Icon name="minus-circle" size={iconSize} color="#900" />*/}
                <EvilIcon name="minus" size={iconSize} color={RemoveColor} />
            </TouchableOpacity>
            <View style={{flex: 1, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={[this.amountPickerItem]}
                    onAcceptChanges={this.handleAcceptAmountChanges}
                    rowNumber={this.props.rowNumber}
                    useListView={true}
                    />
            </View>
            <TouchableOpacity
                    onPress={this.handleIncrease}
                    style={{flex: 0, width: iconBoxSize, height: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}
                    >
                {/*<Icon name="plus-circle" size={iconSize} color="rgb(51, 162, 37)" />*/}
                <EvilIcon name="plus" size={iconSize} color={AddColor} />
            </TouchableOpacity>
         </View>
    }
}
