/* @flow */

import { observable, computed, action, asMap } from 'mobx'
import shortid from 'shortid'

import { Price, sumPrices } from '../Price.js'
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

/*********************************************************************/

const log = _.logger('OrderStore.js')

class OrderStore {

    @observable orderList : Array<OrderItem> = []

    @computed get menuItemsOnOrder() {
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
    }

    /*********************************************************************/

    /* Compute the price for all the selected options */
    getSubTotal = (orderItem : OrderItem) : Float => {
        const menuItem = barStore.getMenuItem(orderItem.menuItemID)
        const allPrices = _.zipWith(menuItem.options, orderItem.selectedOptions,
            (menuItemOption, indices) => indices.map(i => menuItemOption.prices[i])
        )
        return sumPrices(_.flatten(allPrices))
    }

    getTotal = (orderItem : OrderItem) : Float => {
        return this.getSubTotal(orderItem) * orderItem.amount
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
}

export const orderStore = new OrderStore()

_.safeAutorun(() => {
    /* Clear the order list whenever the selected bar changes */
    barStore.barID
    orderStore.clearOrderList()
})

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

// export class OrderItem {
//     @observable amount : number = 1
//     @observable selectedOptions = null
//
//     constructor(menuItem) {
//         this.id = shortid.generate()
//         this.menuItem = menuItem
//         // e.g. [[0], [], [1, 3]]
//         this.selectedOptions = menuItem.options.map(getMenuItemDefaultOptions)
//         this.currency = menuItem.price.currency
//         this.showModal = true
//     }
//
//     /* Compute the price for all the selected options */
//     @computed get subTotal() {
//         const allPrices = _.zipWith(this.menuItem.options, this.selectedOptions,
//             (menuItemOption, indices) => indices.map(i => menuItemOption.prices[i])
//         )
//         return sumPrices(_.flatten(allPrices))
//     }
//
//     @computed get total() {
//         return this.subTotal * this.amount
//     }
//
//     toJSON = () => {
//         return {
//             menuItem: this.menuItem,
//             selectedOptions: this.selectedOptions,
//             amount: this.amount,
//         }
//     }
//
//     static fromJSON = (orderItemJSON) : OrderItem => {
//         const orderItem = new OrderItem(orderItemJSON.menuItem)
//         orderItem.selectedOptions = orderItemJSON.selectedOptions
//         orderItem.amount = orderItemJSON.amount
//         orderItem.showModal = false
//         return orderItem
//     }
// }
