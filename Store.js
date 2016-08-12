import { observable, transaction, computed } from 'mobx'
import { Alert } from 'react-native'
import { emptyResult, graphQL } from './HTTP.js'
import _ from 'lodash'

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

export class Store {

    // [ lat, lon ]
    @observable location = null

    // DownloadResult[schema.Bar]
    @observable bar   = null

    // BarID
    @observable barID = null

    // DownloadResult[ List[schema.Bar] ]
    @observable barList = null

    // Order
    @observable order = null

    // ScrollableTabView
    @observable tabView = null

    constructor() {
        this.bar     = emptyResult()
        this.barList = emptyResult()
    }

    setCurrentTab = (i) => {
        this.tabView.goToPage(i)
    }

    initialize = () => {
        // TODO: Load saved state from local storage
        this.setBarList()
    }

    getBarInfo(barID, menu) {
        const menuQuery = !menu ? '' : `
            menu {
                beer {
                    ...SubMenuFragment
                }
                wine {
                    ...SubMenuFragment
                }
                spirits {
                    ...SubMenuFragment
                }
                cocktails {
                    ...SubMenuFragment
                }
                water {
                    ...SubMenuFragment
                }
            }
        `
        const fragments = `
            fragment PriceFragment on Price {
                currency
                option
                price
            }

            fragment SubMenuFragment on SubMenu {
                image
                menuItems {
                    name
                    desc
                    images
                    tags
                    price {
                        ...PriceFragment
                    }
                    options {
                        name
                        optionList
                        prices {
                            ...PriceFragment
                        }
                        default
                    }
                }
            }
        `

        var query = `
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
                    ${menuQuery}
                }
            }
            `
            if (menuQuery)
                query += fragments
            return graphQL(query).then((downloadResult) => {
                return downloadResult.update((data) => data.bar)
            })
    }

    setBarID(barID) {
        transaction(() => {
            this.bar = emptyResult().downloadStarted()
            this.barID = barID
        })
        this.getBarInfo(barID, true)
            .then((downloadResult) => {
                this.bar = downloadResult
            }).catch((error) => {
                this.bar = emptyResult().downloadError(error.message)
            })
    }

    setBarList = (location) => {
        const loc = location || this.location
        this.barList.downloadStarted()
        this.getBarInfo("1")
            .then((downloadResult) => {
                this.barList = downloadResult.update((value) => [value])
            }).catch((error) => {
                this.barList = emptyResult().downloadError(error.message)
            })
    }

    loadFromLocalStorage = () => {
        // TODO: implement
    }

    saveToLocalStorage = () => {
        // TODO: implement
    }
}

const popup = (title, message) => Alert.alert(title, message)

export const store = new Store()
