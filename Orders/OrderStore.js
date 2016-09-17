/* @flow */

import { observable, computed, action, asMap } from 'mobx'
import shortid from 'shortid'

import { DownloadResult, emptyResult, downloadManager, NetworkError, graphQLArg } from '../HTTP.js'
import { Price, getCurrencySymbol, sumPrices } from '../Price.js'
import { updateSelection } from '../Selection.js'
import { store } from '../Store.js'
import { barStore } from '../Bar/BarStore.js'
import { paymentStore } from '../Payment/PaymentStore.js'
import { loginStore } from '../Login.js'
import { getStripeToken } from '../Payment/StripeAPI.js'
// import uuid from 'react-native-uuid'
import * as _ from '../Curry.js'

const uuid = () => {
    var id = ""
    for (var i = 0; i < 4; i++) {
        id += shortid.generate()
    }
    return id
}

/*********************************************************************/

import type { BarID, MenuItemID, DateType, Time } from '../Bar/Bar.js'
import type { Int, String } from '../Types.js'

export type OrderItem = {
    id:                 ID,
    // barID:              BarID,
    menuItemID:         MenuItemID,
    selectedOptions:    Array<Array<String>>,
    amount:             Int,
}

export type OrderState = {
    orderList: Array<OrderItem>,
}

export type OrderResult = {
    date:           DateType,
    time:           Time,
    queueSize:      Int,
    estimatedTime:  Float,
    receipt:        String,
    userName:       String,
    orderList:      Array<OrderItem>,
}

/*********************************************************************/

const { log, assert } = _.utils('./Orders/OrderStore.js')

class OrderStore {

    @observable orderList : Array<OrderItem> = []

    // Update asynchronously
    @observable total : Float = 0.0

    @observable paymentModalVisible = false
    @observable activeOrderID : ?ID = null
    @observable orderResultDownload  : DownloadResult<OrderResult> = emptyResult()

    getOrderResultDownload = () => this.orderResultDownload

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

    @action clearOrderList = () => {
        this.setOrderList([])
        this.clearOrderToken()
    }

    @computed get currency() {
        return 'Sterling'
    }

    /*********************************************************************/

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
    @computed get _total() : Float {
        return this.orderListTotal(this.orderList)
    }

    @computed get totalText() : String {
        const total = this.total
        if (!this.haveOrders)
            return ""
        const currencySymbol = getCurrencySymbol(this.currency)
        return `${currencySymbol}${total.toFixed(2)}`
    }

    @computed get totalTextWithParens() : String {
        if (!this.haveOrders)
            return ""
        return `(${this.totalText})`
    }

    /*********************************************************************/

    getState = () : OrderState => {
        return {
            orderList:  this.orderList,
            orderToken: this.getActiveOrderToken(),
            orderResultDownload: this.orderResultDownload.getState(),
        }
    }

    emptyState = () => {
        return {
            orderList: [],
            orderToken: null,
            orderResultDownload: emptyResult(),
        }
    }

    @action setState = (orderState : OrderState) => {
        if (orderState.orderList)
            this.setOrderList(orderState.orderList)
        if (orderState.orderToken) {
            this.setOrderToken(orderState.orderToken)
            if (orderState.orderResultDownload)
                this.orderResultDownload.setState(orderState.orderResultDownload)
        }
    }

    /*********************************************************************/

    getActiveOrderToken = () => this.activeOrderID

    @action setPaymentModalVisibility = (visible : Bool) => {
        this.paymentModalVisible = visible
    }

    @action setOrderToken = (token) => {
        this.activeOrderID = token
    }

    @action setFreshOrderToken = () => {
        this.setOrderToken(uuid())
    }

    @action clearActiveOrderToken = () => {
        this.activeOrderID = null
    }

    @action clearOrderToken = () => {
        this.orderResultDownload.reset()
    }

    placeActiveOrderStub = () => {
        this.orderResultDownload.downloadFinished({
            errorMessage:   null,
            queueSize:      2,
            estimatedTime:  90,
            receipt:        'x4J',
            userName:       'Mark',
            orderList:      this.orderList.slice(),
        })
    }

    /* Submit order to server */
    placeActiveOrder = _.logErrors(async () : Promise<DownloadResult<OrderResult>> => {
        return this.placeActiveOrderStub()

        const barID    = barStore.barID
        /* TODO: force lorgin at payment screen... */
        const userName = loginStore.userName || 'Mark'
        const currency = 'Sterling'

        assert(barID != null)
        assert(userName != null)

        var stripeToken
        this.orderResultDownload.downloadStarted()
        try {
            stripeToken = await getStripeToken(paymentStore.getSelectedCard())
        } catch (err) {
            log('Stripe token error', err)
            if (!(err instanceof NetworkError))
                throw err
            this.orderResultDownload.downloadError(err.message)
            return
        }
        log('Got stripe token', stripeToken)

        const total     = this.orderListTotal(this.orderList)
        const orderList = this.orderList.map(orderItem => {
            return {
                id:                     orderItem.id,
                menuItemID:             orderItem.menuItemID,
                selectedOptions:        orderItem.selectedOptions,
                amount:                 orderItem.amount,
            }
        })

        /* TODO: Utility to build queries correctly and safely */
        const query = `
            query {
                placeOrder(
                        barID:       ${graphQLArg(barStore.barID)}
                        userName:    ${graphQLArg(userName)},
                        currency:    ${graphQLArg(currency)},
                        price:       ${graphQLArg(total)},
                        orderList:   ${graphQLArg(orderList)},
                        stripeToken: ${graphQLArg(stripeToken)}
                        ) {
                    errorMessage
                    time {
                        hour
                        minute
                        second
                    }
                    userName
                	queueSize
                    estimatedTime
                    receipt
                }
            }
        `
        log('Sending query:', query)
        const orderResultDownload = await downloadManager.graphQLMutate(query)
        log('Order placed:', orderResultDownload)

        if (orderResultDownload.value) {
            orderResultDownload.update(value => {
                const result = value.placeOrder
                result.orderList = this.orderList
                assert(result.userName != null)
                assert(result.queueSize != null)
                assert(result.estimatedTime != null)
                assert(result.receipt != null)
                return result
            })
        }
        this.orderResultDownload = orderResultDownload
    })
}

export type OrderItem = {
    id:                 ID,
    menuItemID:         MenuItemID,
    selectedOptions:    Array<Array<String>>,
    amount:             Int,
}

export const orderStore = new OrderStore()

_.safeAutorun(() => {
    /* Clear the order list whenever the selected bar changes */
    barStore.barID
    orderStore.clearOrderList()
})

const periodicallyUpdateTotal = () => {
    orderStore.total = orderStore._total
    setTimeout(periodicallyUpdateTotal, 600)
}

periodicallyUpdateTotal()

// _.safeAutorun(() => {
//     const total = _.sum(orderStore.orderList.map(orderStore.getTotal))
//     setTimeout(() => orderStore.total = total, 0)
// })

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
    return updateSelection(menuItemOption.optionType, [], option)
}
