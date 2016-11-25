/* @flow */

import { observable, computed, action, asMap, autorun } from 'mobx'
import shortid from 'shortid'

import { StripeTokenDownload } from '/network/api/orders/payment'
import { PlaceOrderDownload } from '/network/api/orders/order'
import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { downloadManager } from '/network/http'

/* TODO: Imports */
import { addToSelection } from './orderSelection'
import { barStore } from '../barstore'
import { paymentStore } from './paymentstore'
import { loginStore } from '../loginstore'
import { barStatusStore } from '../barstatusstore'
import { messageStore } from '../messagestore'
import { modalStore } from '../modalstore'
import { getTime } from '/utils/time'
import * as _ from '/utils/curry'

import type { BarID, MenuItemID, DateType, Time, OrderItemID } from '../bar/Bar.js'
import type { Int, String } from '../Types.js'

const { log, assert } = _.utils('./model/orders/orderstore.js')

/*********************************************************************/
/* Types                                                             */
/*********************************************************************/

export type OrderItem = {
    id:                 OrderItemID,
    // barID:           BarID,
    menuItemID:         MenuItemID,
    selectedOptions:    Array<Array<String>>,
    amount:             Int,
}

export type OrderState = {
    orderList: Array<OrderItem>,
}

export type RefundOrderItem = {
    id:     OrderItemID,
    amount: Int,
}

export type Refund = {
    timestamp:      Float,
    refundedItems:  Array<RefundOrderItem>,
    reason:         ?String,
}

export type OrderResult = {
    // date:           DateType,
    // time:           Time,
    barID:          String,
    orderID:        String,
    timestamp:      Float,
    // queueSize:      Int,
    // estimatedTime:  Float,
    receipt:        String,
    userName:       String,
    menuItems:      Array<MenuItem>,
    orderList:      Array<OrderItem>,
    totalAmount:    Int,
    totalPrice:     Int,
    tip:            Int,
    currency:       Currency,

    delivery:       String,
    tableNumber:    ?String,
    pickupLocation: ?String,

    refunds:        Array<Refund>,
    completed:      Bool,
    completedTimestamp: ?Float,
}

export const getRefundedItemAmount = (refund : Refund) => {
    return _.sum(refund.refundedItems.map(
        refundedItem => refundedItem.amount
    ))
}

export const isRefundedCompletely = (orderResult) => {
    const totalOrderedAmount = _.sum(orderResult.orderList.map(orderItem => orderItem.amount))
    const totalRefundedAmount = _.sum(orderResult.refunds.map(getRefundedItemAmount))
    return totalOrderedAmount === totalRefundedAmount
}

/*********************************************************************/
/* Store                                                             */
/*********************************************************************/

class OrderStore {

    @observable orderList      : Array<OrderItem> = []
    @observable tipFactor      : Float = 0.0
    @observable tipAmount      : Int = 0

    @observable delivery       : String = 'Table'
    @observable tableNumber    : ?String = null
    @observable pickupLocation : String = null
    // Keep this so that we can update the % independently of the price in the UI

    @observable _checkoutVisible = false
    @observable activeOrderID : ?ID = null
    @observable orderID = null

    /* Checkout ID which is fresh for every checkout that is entered.
       The user may try checking out several times with a single shopping cart
       without ever completing the order.
    */
    @observable checkoutID = null


    /* Shopping Card ID. Always initialized, and cleared whenever an order
       is completed
    */
    @observable cartID = _.uuid()

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    getState = () : OrderState => {
        return {
            orderList:              this.orderList,
            orderToken:             this.getActiveOrderToken(),
            delivery: {
                delivery:           this.delivery,
                tableNumber:        this.tableNumber,
                pickupLocation:     this.pickupLocation,
            },
            cartID:                 this.cartID,
            checkoutID:             this.checkoutID,
            orderID:                this.orderID,
        }
    }

    emptyState = () => {
        return {
            orderList:  [],
            orderToken: null,
            delivery:   null,
            cartID:     _.uuid(),
            checkoutID: null,
            orderID:    null,
        }
    }

    @action setState = (orderState : OrderState) => {
        if (orderState.orderList)
            this.setOrderList(orderState.orderList)
        if (orderState.orderToken) {
            this.activeOrderID = orderState.orderToken
        }
        if (orderState.cartID)
            this.cartID = orderState.cartID
        this.checkoutID = orderState.checkoutID
        if (orderState.delivery) {
            this.delivery = orderState.delivery.delivery
            this.tableNumber = orderState.delivery.tableNumber
            this.pickupLocation = orderState.delivery.pickupLocation
        }
        this.orderID = orderState.orderID
    }

    /*********************************************************************/
    /* Downloads                                                         */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new StripeTokenDownload(() => {
            return {
                selectedCard:        paymentStore.getSelectedCard(),
            }
        }))
        downloadManager.declareDownload(new PlaceOrderDownload(
            () => {
                return {
                    barID:               barStore.barID,
                    stripeToken:         this.stripeToken,
                    authToken:           loginStore.getAuthToken(),
                    userName:            loginStore.userName,
                    price:               this.total,
                    tipAmount:           this.tipAmount,
                    currency:            this.currency,
                    orderList:           this.orderList,
                    delivery:            this.delivery,
                    tableNumber:         this.tableNumber,
                    pickupLocation:      this.pickupLocation,
                }
            },
            {
                onFinish: () => {
                    const download = this.getPlaceOrderDownload()
                    this.setOrderID(download.orderID)
                },
            }
        ))
    }

    initialized = () => {
        /*
        When we have a valid bar status, it is possible the user has selected
        a delivery method that is incompatible with this bar status. In this
        case, show the delivery method popup to the user.
        */
        autorun(() => {
            if (barStatusStore.barStatus != null &&
                    this.deliveryMethodHasChanged &&
                    !loginStore.isBarOwner &&
                    this.orderList.length > 0
                ) {
                this.confirmDeliveryMethod()
                modalStore.openDeliveryModal()
            }
        })
    }

    getPaymentTokenDownload = () => downloadManager.getDownload('stripe')
    getPlaceOrderDownload   = () => downloadManager.getDownload('placeOrder')
    getOrderStatusDownload  = () => downloadManager.getDownload('order status')

    @action setOrderID = (orderID) => {
        this.orderID = orderID
    }

    /*********************************************************************/
    /* Menu Items in Active Order                                        */
    /*********************************************************************/

    getMenuItemsOnOrder = (orderList : Array<OrderItem>) : Array<MenuItem> => {
        const seen = []
        return orderList.map(orderItem => {
                if (!_.includes(seen, orderItem.menuItemID)) {
                    seen.push(orderItem.menuItemID)
                    return barStore.getMenuItem(orderItem.menuItemID)
                }
                return null
            })
            .filter(menuItem => menuItem != null)
    }

    @computed get menuItemsOnOrder() : Array<MenuItem> {
        return this.getMenuItemsOnOrder(this.orderList)
    }

    /*********************************************************************/
    /* Order List                                                        */
    /*********************************************************************/

    @action addOrderItem = (orderItem : OrderItem) => {
        this.orderList.push(orderItem)
    }

    @action removeOrderItem = (orderItem1 : OrderItem) => {
        this.setOrderList(
            this.orderList.filter(
                orderItem2 => orderItem2.id !== orderItem1.id
            )
        )
    }

    getOrderList = (menuItemID) => {
        return this.orderList.filter(orderItem => orderItem.menuItemID === menuItemID)
    }

    @action setOrderList = (orderList : Array<OrderItem>) => {
        assert(orderList != null)
        this.orderList = orderList
    }

    /*********************************************************************/
    /* Tips and Total                                                    */
    /*********************************************************************/

    @action resetTip = () => {
        this.setTipFactor(this.tipFactor)
    }

    @computed get currency() {
        return 'Sterling'
    }

    formatPrice = (price, currency) => {
        currency = currency || this.currency
        const priceText = (price / 100).toFixed(2)
        switch (currency) {
            case 'Sterling':
                return '£' + priceText
            default:
                throw Error(`Currency ${currency} not supported yet`)
        }
    }

    /* Compute the price for all the selected options */
    getSubTotal = (orderItem : OrderItem) : Float => {
        const menuItem = barStore.getMenuItem(orderItem.menuItemID)
        if (!menuItem) {
            /* Menu items may be re-rendered while the order list is being
               cleared after a bar change. Just return 'null' in that case
               to avoid errors in the subtotal calculation
            */
            return null
        }

        const allPrices = _.zipWith(menuItem.options, orderItem.selectedOptions,
            (menuItemOption, options) => {
                return options.map(option => this.getOptionPrice(menuItemOption, option))
            }
        )
        return sumPrices(_.flatten(allPrices))
    }

    getOptionPrice = (menuItemOption : MenuItemOption, option : String) : Price => {
        const i = _.find(menuItemOption.optionList, option)
        return menuItemOption.prices[i]
    }

    getAmount = (orderList : Array<OrderItem>) => {
        return _.sum(orderList.map(orderItem => orderItem.amount))
    }

    getTotal = (orderItem : OrderItem) : Float => {
        return this.getSubTotal(orderItem) * orderItem.amount
    }

    @computed get haveOrders() : Bool {
        return _.any(this.orderList.map(orderItem => orderItem.amount > 0))
    }

    orderListTotal = (orderList : Array<OrderItem>) : Float => {
        return _.sum(orderList.map(this.getTotal))
    }

    // Update the total asynchronously for UI responsiveness (see the autorun below)
    @computed get total() : Float {
        return this.orderListTotal(this.orderList)
    }

    @computed get totalPlusTip() : Float {
        return this.total + this.tipAmount
    }

    @computed get totalText() : String {
        const total = this.total + this.tipAmount
        if (!this.haveOrders)
            return ""
        const currencySymbol = getCurrencySymbol(this.currency)
        return `${currencySymbol}${(total / 100).toFixed(2)}`
    }

    @computed get totalTextWithParens() : String {
        if (!this.haveOrders)
            return ""
        return `(${this.totalText})`
    }

    /*********************************************************************/
    /* Checkout                                                          */
    /*********************************************************************/

    /* Default delivery methods. For example, the user may have selected
       table service, but this may be disabled by the bar. In this case
       delivery === 'Table' but defaultDelivery === 'Pickup'.
    */
    @computed get defaultDelivery() : ?Delivery {
        if (!barStatusStore.allowOrderPlacing)
            return null
        if (!barStatusStore.haveTableService)
            return 'Pickup'
        else if (!barStatusStore.haveOpenPickupLocations)
            return 'Table'
        return this.delivery || 'Table'
    }

    @computed get defaultTableNumber() : ?String {
        return this.tableNumber && "" + this.tableNumber
    }

    @computed get defaultPickupLocation() : ?String {
        if (!barStatusStore.allowOrderPlacing || this.defaultDelivery !== 'Pickup')
            return null
        const pickDefault = (
            !this.pickupLocation ||
            !_.includes(barStatusStore.openPickupLocationNames, this.pickupLocation)
        )
        if (pickDefault) {
            if (barStatusStore.openPickupLocationNames.length) {
                return barStatusStore.openPickupLocationNames[0]
            }
            return null
        }
        return this.pickupLocation
    }

    @computed get deliveryMethodHasChanged() : Bool {
        if (!this.delivery)
            return false
        return (
            this.defaultDelivery !== this.delivery ||
            this.defaultTableNumber !== this.tableNumber ||
            this.defaultPickupLocation !== this.pickupLocation
        )
    }

    @computed get haveDeliveryMethod() {
        if (!barStatusStore.allowOrderPlacing)
            return false
        if (this.delivery === 'Table')
            return !!this.tableNumber
        else
            return !!this.pickupLocation
    }

    @computed get haveDefaultDeliveryMethod() {
        if (!barStatusStore.allowOrderPlacing)
            return false
        if (this.defaultDelivery === 'Table')
            return !!this.defaultTableNumber
        else
            return !!this.defaultPickupLocation
    }

    @computed get checkoutVisible() {
        return this._checkoutVisible // && this.haveDeliveryMethod
    }

    @action setDelivery = (delivery) => {
        this.delivery = delivery
    }

    @action setTableNumber = (tableNumber) => {
        this.tableNumber = tableNumber
    }

    @action setPickupLocation = (pickupLocation : String) => {
        this.pickupLocation = pickupLocation
    }

    @action confirmDeliveryMethod = () => {
        this.delivery = this.defaultDelivery
        this.pickupLocation = this.defaultPickupLocation
    }

    @action setTipFactor = (factor) => {
        const total = this.total
        this.tipFactor = factor
        this.tipAmount = Math.ceil(factor * total)
    }

    @action setTipAmount = (amount) => {
        const total = this.total
        this.tipFactor = amount / total
        this.tipAmount = Math.ceil(amount)
    }

    @action setCheckoutVisibility = (visible : Bool) => {
        this._checkoutVisible = visible
    }

    /*********************************************************************/
    /* Order Placement                                                   */
    /*********************************************************************/

    getActiveOrderToken = () => this.activeOrderID

    @computed get stripeToken() {
        return this.getPaymentTokenDownload().stripeToken
    }

    /* Order Actions */

    @action freshCheckoutID = () => {
        this.checkoutID = _.uuid()
    }

    @action freshOrderToken = () => {
        this.getPaymentTokenDownload().reset()
        this.getPlaceOrderDownload().reset()
        this.activeOrderID = _.uuid()
    }

    /* Submit order to server */
    _placeActiveOrder = async () => {
        /* Get a fresh payment authorization token from stripe */
        await this.getPaymentTokenDownload().forceRefresh()
        if (this.stripeToken) {
            /* Submit order to server along with stripe token */
            await this.getPlaceOrderDownload().forceRefresh()
            this.clearOrderList()
        }
    }

    placeActiveOrder = _.logErrors(async () => {
        try {
            this._placeActiveOrder()
        } catch (e) {
            this.closeReceipt()
        }
    })

    /*********************************************************************/
    /* Clear Orders                                                      */
    /*********************************************************************/

    @action clearOrderList = () => {
        this.setOrderList([])
    }

    /* Close the receipt window, but keep the current shopping cart */
    @action closeReceipt = () => {
        this.activeOrderID = null
        this.orderID = null
    }

    /* Clear the order list at the bar, e.g. after closing the receipt window */
    @action closeReceiptAndResetCart = () => {
        this.clearOrderList()
        this.activeOrderID = null
        this.cartID = _.uuid()
        this.resetTip()
    }

    /* Clear all order-related data, e.g. when switching bars */
    @action clearAllOrderData = () => {
        this.closeReceiptAndResetCart()
        this.delivery = null
        this.tableNumber = null
        this.pickupLocation = null
    }

}

export const orderStore = new OrderStore()

autorun(() => {
    /* Clear the order list whenever the selected bar changes */
    barStore.barID
    orderStore.clearAllOrderData()
})

/*********************************************************************/
/* Create new Order Items                                            */
/*********************************************************************/

export const createOrderItem = (menuItem : MenuItem) : OrderItem => {
    return {
        id:                 shortid.generate(),
        menuItemID:         menuItem.id,
        selectedOptions:    menuItem.options.map(getMenuItemDefaultOptions),
        amount:             1,
    }
}

const getMenuItemDefaultOptions = (menuItemOption : MenuItemOption) : String => {
    if (menuItemOption.defaultOption == undefined)
        return []
    assert(menuItemOption.defaultOption >= 0)
    const option = menuItemOption.optionList[menuItemOption.defaultOption]
    return addToSelection(menuItemOption.optionType, [], option)
}

/*********************************************************************/
/* Utils                                                             */
/*********************************************************************/

const getCurrencySymbol = (symbol) => {
    if (symbol == 'Sterling') {
        return '£'
    } else if (symbol == 'Euros') {
        return '€'
    } else if (symbol == 'Dollars') {
        return '$'
    } else {
        throw Error('Unknown currency symbol:' + symbol)
    }
}

const sumPrices = (prices) => {
    return _.sum(prices.map(price => price.price))
}
