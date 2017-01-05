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
} from '/components/Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { store, orderStore, menuItemModalStore } from '/model/store.js'
import { analytics } from '/model/analytics.js'
import { TextButton } from '../Button.js'
import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

const { log, assert } = _.utils('/components/menu/MenuItemOrderList.js')

@observer
export class MenuItemOrderList extends PureComponent {
    /* properties:

    Render the order selection, e.g. "1x pint + shandy"
        menuItem: MenuItem
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
            // borderColor: config.theme.primary.medium,
            // borderBottomLeftRadius: 10,
            // borderBottomRightRadius: 10,
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
            return null

        return (
            <View style={this.styles.view}>
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
        )
    }

    renderOrderItem = (orderItem : OrderItem, i : Int) : Component => {
        return <OrderSelection
                    key={orderItem.id}
                    rowNumber={i}
                    menuItem={this.props.menuItem}
                    orderStore={this.props.orderStore}
                    orderItem={orderItem} />
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
const rowHeight = 50
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
                <CustomizeButton
                    menuItem={this.props.menuItem}
                    orderItem={this.props.orderItem}
                    />
            </View>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, height: iconBoxSize, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="minus" size={iconSize} color={config.theme.removeColor} />
            </TouchableOpacity>
            <T style={{fontSize: 18, color: '#000', minWidth: 25, textAlign: 'center'}}>{this.orderItem.amount}</T>
            <TouchableOpacity
                    onPress={this.handleIncrease}
                    style={{flex: 0, width: iconBoxSize, height: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}
                    >
                <EvilIcon name="plus" size={iconSize} color={config.theme.addColor} />
            </TouchableOpacity>
         </View>
    }
}

@observer
class CustomizeButton extends PureComponent {
    /* properties:
        menuItem: MenuItem
        orderItem: OrderItem
    */

    @computed get label() {
        return _.flatten(this.props.orderItem.selectedOptions)
    }

    @action customize = () => {
        menuItemModalStore.open({
            menuItem:  this.props.menuItem,
            orderItem: this.props.orderItem,
            type:      'Change',
        })
    }

    render = () => {
        return (
            <TextButton
                label={this.label}
                fontSize={16}
                onPress={this.customize}
                style={{flex: 1}}
                alignLeft={true}
                // borderColor={color}
                textColor='#000'
                prominent={false}
                />
        )
    }
}
