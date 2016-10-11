// TODO: Enable flow type checking

import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
    Icon,
    EvilIcon,
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemCard } from './MenuItemCard.js'
import { LazyComponent, lazyWrap } from '../LazyComponent.js'
import { Price, sumPrices } from '../Price.js'
import { PickerCollection, PickerItem } from '../Pickers.js'
import { store, orderStore } from '../Store.js'
import { analytics } from '../Analytics.js'
import { getMenuItemImage } from './MenuItemImage.js'
import * as _ from '../Curry.js'
import { config } from '../Config.js'

const { log, assert } = _.utils('./Menu/MenuItemOrderList.js')

@observer
export class MenuItemOrderList extends PureComponent {
    /* properties:

    Render the order selection, e.g. "1x pint + shandy"
        menuItem: MenuItem
        showModalFor: ?OrderItem
            order item that we should show a modal for (just once)
        onModalClose: () => void
        orderStore: OrderStore
    */

    @computed get orderItems() : Array<OrderItem> {
        return this.props.orderStore.getOrderList(this.props.menuItem.id)
    }

    styles = StyleSheet.create({
        view: {
            borderWidth: 0.5,
            borderLeftWidth: 0.5,
            borderRightWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: '#000',
            // borderRadius: 10,
            marginLeft: 5,
            marginRight: 5,
        },
        row: {
            flexDirection: 'row',
        },
        orderItem: {
            flex: 1,
        },
    })

    render = () => {
        if (!this.orderItems.length)
            return <View />

        return <View style={this.styles.view}>
            <View style={this.styles.row}>
                <View style={this.styles.orderItem}>
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
                    onModalClose={this.props.onModalClose} />
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


const styles = {
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
        onModalClose: (scrollDown : Bool) => void
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
        if (this.orderItem.amount === 0) {
            analytics.trackRemoveItem(this.props.menuItem, this.orderItem)
            this.props.orderStore.removeOrderItem(this.orderItem)
        } else {
            this.orderItem.amount = _.max(0, this.orderItem.amount - 1)
        }
    }

    handleClose = (scrollDown = true) => {
        this.props.onModalClose(scrollDown)
    }

    @action handleAcceptAmountChanges = (allSelectedOptions : [[number]]) => {
        const amountSelection : [number] = allSelectedOptions[0]
        this.orderItem.amount = amountSelection[0]
        this.handleClose(scrollDown = false)
    }

    @action handleAcceptOptions = (allSelectedOptions : [[Int]]) => {
        const menuItem = this.props.menuItem
        const stringOptions = allSelectedOptions.map(
            (options, i) => options.map(
                intOption => menuItem.options[i].optionList[intOption]
            )
        )
        this.orderItem.selectedOptions = stringOptions
        this.handleClose(scrollDOwn = false)
    }

    @action handleFirstAccept = () => {
        analytics.trackAddItem(this.props.menuItem, this.orderItem)
        this.handleClose(scrollDown = true)
    }

    @action handleFirstCancel = () => {
        this.props.orderStore.removeOrderItem(this.orderItem)
        this.handleClose(scrollDown = false)
    }

    get showModal() {
        return this.props.showModal
    }

    /* Render menu image */
    renderHeader = () => {
        const menuItem = this.props.menuItem
        const url = getMenuItemImage(menuItem)
        // return <View style={{height: 200, backgroundColor: '#000'}} />
        if (!url)
            return <View />

        return <LazyComponent style={{height: 200}}>
            <MenuItemCard
                key={url}
                menuItem={menuItem}
                /* onBack={this.handleClose} */
                showTitle={false}
                showHeart={true}
                showTags={true}
                imageHeight={200}
                />
            {/*
            <Img
                key={url}
                url={url}
                style={{height: 200}}
                />
            */}
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
