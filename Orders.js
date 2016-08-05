import { observable } from 'mobx'
/*
import { Alias, Dict, DataType, Case, BasicTypes } from './Typing.js'

export const DrinkID = new Alias('DrinkID', BasicTypes.str)

// pint, half-pint, shot, double shot, small glass, medium glass, large glass, bottle, etc
export const DrinkSize = new Alias('DrinkSize', BasicTypes.str)

// shandy, lime, blackcurrant, etc
export const DrinkOpts = new Alias('DrinkOpt', new List(BasicTypes.str))

export const OrderItem = new Dict('OrderItem',
    [ ['size',      DrinkSize]
    , ['opts',      DrinkOpts]
    ])

export const Order = new SimpleDict(DrinkID, new List(OrderItem))

export const orderList = observable(asMap())
*/


export class OrderItem {
    constructor(size, opts, count) {
        this.size = size    // pint, half-pint, glass, bottle, etc
        this.opts = opts    // top
        this.count = count  // number of drinks to order
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
