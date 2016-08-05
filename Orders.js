import { observable } from 'mobx'

export class OrderItem {

    @observable size
    @observable opts
    @observable count

    constructor(size, opts, count) {
        this.size = size    // str, e.g. 'pint', 'half-pint', 'glass', 'bottle', etc
        this.opts = opts    // [str], e,g. ["shandy"]
        this.count = count  // int, number of drinks to order
    }
}

class OrderList {
    @observable orders = asMap()

    getOrder = (drinkID) => {
        return this.orders.get(drinkID)
    }

    /* Add an item to the order list */
    export const addOrder = (drinkID, orderItem) => {
        var items = this.orders.get(drinkID)
        if (items === undefined) {
            items = []
            this.orders.set(drinkID, items)
        }
        items.push(orderItem)
        this.orders.set(drinkID, items)
    }

    /* Simplify order list by removing entries with a 0 count */
    export const simplifyOrders = () => {
        this.orders.forEach((orderItems, drinkID) => {
            orderItems = orderItems.filter((orderItem) => {
                return orderItem.count > 0
            })
            this.orders.set(drinkID, orderItems)
        })
    }

    /* Remove any items from the order list */
    export const clearOrders = () => {
        this.orders.clear()
    }
}
