/* @flow */

import { observable, computed, action, asMap } from 'mobx'
import shortid from 'shortid'

import { Price, getCurrencySymbol, sumPrices } from '../Price.js'
import { updateSelection } from '../Selection.js'
import { store } from '../Store.js'
import { barStore } from '../Bar/BarStore.js'
import * as _ from '../Curry.js'

/*********************************************************************/

import type { BarID, MenuItemID } from '../Bar/Bar.js'
import type { Int, String } from '../Types.js'

export type OrderItem = {
    barID:              BarID,
    menuItemID:         MenuItemID,
    selectedOptions:    Array<Array<Int>>,
    amount:             Int,
}

export type OrderState = {
    orderList: Array<OrderItem>,
}

export type OrderResult = {
    errorMessage:   ?String,
    queueSize:      Int,
    estimatedTime:  Float,
    receipt:        String,
    userName:       String,
    // orderList:      Array<OrderItem>,
}

/*********************************************************************/

const { log, assert } = _.utils('./Orders/OrderStore.js')



class OrderStore {

    @observable orderList : Array<OrderItem> = []

    // Update asynchronously
    @observable total : Float = 0.0

    @observable activeOrderID : ?ID = null
    @observable orderResultDownload  : DownloadResult<OrderResult> = emptyResult()

    @computed get menuItemsOnOrder() : Array<MenuItem> {
        const seen = []
        return this.orderList.map(orderItem => {
                if (!_.includes(seen, orderItem.menuItemID)) {
                    seen.push(orderItem.menuItemID)
                    return barStore.getMenuItem(orderItem.menuItemID)
                }
                return null
            })
            .filter(menuItem => menuItem != null)
    }

    @action addOrderItem = (orderItem : OrderItem) => {
        this.orderList.push(orderItem)
    }

    @action removeOrderItem = (orderItem1 : OrderItem) => {
        this.orderList = this.orderList.filter(
            orderItem2 => orderItem2.id !== orderItem1.id
        )
    }

    getOrderList = (menuItemID) => {
        return this.orderList.filter(orderItem => orderItem.menuItemID === menuItemID)
    }

    @action setOrderList = (orderList : Array<OrderItem>) => {
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
            (menuItemOption, indices) => indices.map(i => menuItemOption.prices[i])
        )
        return sumPrices(_.flatten(allPrices))
    }

    getTotal = (orderItem : OrderItem) : Float => {
        return this.getSubTotal(orderItem) * orderItem.amount
    }

    @computed get haveOrders() : Bool {
        return _.any(this.orderList.map(orderItem => orderItem.amount > 0))
    }

    // Update the total asynchronously for UI responsiveness (see the autorun below)
    @computed get _total() : Float {
        return _.sum(this.orderList.map(this.getTotal))
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
            orderList: this.orderList,
        }
    }

    @action setState = (orderState : OrderState) => {
        this.setOrderList(orderState.orderList)
    }

    /*********************************************************************/

    getActiveOrderToken = () => this.activeOrderID

    @action setOrderToken = () => {
        this.activeOrderID = shortid.generate()
    }

    @action clearOrderToken = () => {
        this.activeOrderID = null
    }

    /* Submit order to server */
    placeActiveOrder = _.logErrors(async () => {
        // this.stripeTokenDownload.downloadFinished('someFakeStripeToken')
        this.orderResultDownload.downloadFinished({
            errorMessage:   null,
            queueSize:      2,
            estimatedTime:  90,
            receipt:        'x4J',
            userName:       'Mark F',
        })
    })
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

const getMenuItemDefaultOptions = (menuItemOption : MenuItemOption) : Int => {
    if (menuItemOption.defaultOption == undefined)
        return []
    return updateSelection(menuItemOption.optionType, [], menuItemOption.defaultOption)
}
