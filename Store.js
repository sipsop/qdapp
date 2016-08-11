import { observable, transaction } from 'mobx'
import { Alert } from 'react-native'

export class OrderItem {

    @observable itemID
    @observable size
    @observable opts
    @observable count

    constructor(itemID, drinkSize, drinkOpts, drinkCount) {
        this.itemID = itemID
        this.drinkSize = drinkSize    // str, e.g. 'pint', 'half-pint', 'glass', 'bottle', etc
        this.drinkOpts = drinkOpts    // [str], e,g. ["shandy"]
        this.drinkCount = drinkCount  // int, number of drinks to order
    }
}

export class Order {

    @observable order = asMap()

    getOrder = (itemID) => {
        return this.order.get(itemID)
    }

    /* Add an item to the order list */
    addOrder = (itemID, orderItem) => {
        var items = this.order.get(itemID)
        if (items === undefined) {
            items = []
            this.order.set(itemID, items)
        }
        items.push(orderItem)
    }

    /* Simplify order list by removing entries with a 0 count */
    simplifyOrders = () => {
        this.order.forEach((orderItems, itemID) => {
            orderItems = orderItems.filter((orderItem) => {
                return orderItem.count > 0
            })
            this.orders.set(itemID, orderItems)
        })
    }

    /* Remove any items from the order list */
    clearOrders = () => {
        this.orders.clear()
    }
}

class Errors {

    @observable barInfoError = null

    handleBarInfoError = (error) => {
        this.barInfoError = "" + error
    }

}

export class Store {

    @observable location = null
    @observable barList = null

    @observable bar   = null
    @observable order = null

    @observable tabView = null
    @observable errors = new Errors()

    constructor(bar, menu, order) {
        this.bar   = bar
        this.order = order
    }

    initialize = () => {
        // TODO: Load saved state from local storage
        this.setBarList()
    }

    setCurrentTab = (i) => {
        this.tabView.goToPage(i)
    }

    setBarList = (location) => {
        const loc = location || this.location
        this.getBarInfo("1")
            .then((bar) => {
                transaction(() => {
                    this.barList = [bar]
                    this.errors.barInfoError = null
                })
            })
            .catch(this.errors.handleBarInfoError)
    }

    getBarInfo(barID) {
        // return graphQL('query { bar (id: "1") { id, name } }')
        return graphQL(`
            query {
                bar(id: "${barID}") {
                    id
                    name
                    desc
                    images
                    tags
                    openingTimes {
                        day
                        openTime {
                            hour
                            minute
                        }
                        closeTime {
                            hour
                            minute
                        }
                    }
                    address {
                        lat
                        lon
                        city
                        street
                        number
                        postcode
                    }
                }
            }`)
            .then((data) => data.bar)
    }

    setBarID(barID) {
        this.getBarInfo(barID)
            .then((bar) => { this.bar = bar })
            .catch(this.handleBarInfoError)
    }

    loadFromLocalStorage = () => {
        // TODO: implement
    }

    saveToLocalStorage = () => {
        // TODO: implement
    }
}

const popup = (title, message) => Alert.alert(title, message)

const HOST = 'http://192.168.0.6:5000'

const graphQL = (query) => {
    const httpOptions = {
        method: 'POST',
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/graphql',
        },
        body: query,
    }
    return fetch(HOST + '/graphql', httpOptions)
        .then((response) => response.json())
        .then((data) => data.data)
}

export const store = new Store()
