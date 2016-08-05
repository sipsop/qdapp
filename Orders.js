import { observable } from 'mobx'

export class OrderItem {
    constructor(size, opts, count) {
        this.size = size    // str, e.g. 'pint', 'half-pint', 'glass', 'bottle', etc
        this.opts = opts    // [str], e,g. ["shandy"]
        this.count = count  // int, number of drinks to order
    }
}

export const orders = observable(asMap())

/* Add an item to the order list */
export const addOrder = (drinkID, orderItem) => {
    var items = orders.get(drinkID)
    if (items === undefined) {
        items = []
        orders.set(drinkID, items)
    }
    items.push(orderItem)
    orders.set(drinkID, items)
}

/* Simplify order list by removing entries with a 0 count */
export const simplifyOrders = () => {
    orders.forEach((orderItems, drinkID) => {
        orderItems = orderItems.filter((orderItem) => {
            return orderItem.count > 0
        })
        orders.set(drinkID, orderItems)
    })
}

/* Remove any items from the order list */
export const clearOrders = () => {
    orders.clear()
}
