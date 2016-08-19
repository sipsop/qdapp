import { observable, transaction, computed, autorun } from 'mobx'
import { Alert } from 'react-native'
import { emptyResult, graphQL } from './HTTP.js'
import _ from 'lodash'

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

    @observable menuItemOrders = null
    // @observable menuItemOrdersMap = null // observable maps don't seem to work...

    constructor() {
        this.bar     = emptyResult()
        this.barList = emptyResult()
        autorun(() => {
            const menuItems = this.allMenuItems
            if (!menuItems)
                return
            this.menuItemOrders = menuItems.map(menuItem => [menuItem.id, []])
            this.menuItemOrdersMap = new Map(this.menuItemOrders)
            this.menuItemCache = new Map()
        })
        this.currentPage = 0
    }

    setCurrentTab = (i) => {
        this.currentPage = i
        this.tabView.goToPage(i)
    }

    initialize = () => {
        // TODO: Load saved state from local storage
        this.setBarList()
    }

    @computed get allMenuItems() {
        const bar = this.bar.value
        if (!bar || !bar.menu)
            return undefined

        const menu  = store.bar.value.menu
        const subMenus = (
            [ menu.beer
            , menu.wine
            , menu.spirits
            , menu.cocktails
            , menu.water
            // , menu.snacks
            // , menu.food
            ])
        const menuItems = subMenus.map((subMenu) => subMenu.menuItems)
        return _.flatten(menuItems)
    }

    @computed get menuItemsOnOrder() {
        return this.allMenuItems.filter(menuItem => {
            const orderItems = store.menuItemOrdersMap.get(menuItem.id)
            return orderItems.length > 0
        })
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
                    id
                    name
                    desc
                    images
                    tags
                    price {
                        ...PriceFragment
                    }
                    options {
                        name
                        optionType
                        optionList
                        prices {
                            ...PriceFragment
                        }
                        defaultOption
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
                    phone
                    website
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
            return graphQL(query)
                .then((downloadResult) => {
                    return downloadResult.update((data) => data.bar)
                })
    }

    setBarID(barID) {
        if (this.bar.value && this.bar.value.id === barID) {
            /* All done */
            return
        }
        transaction(() => {
            this.bar = emptyResult().downloadStarted()
            this.barID = barID
        })
        this.getBarInfo(barID, true)
            .then((downloadResult) => {
                try {
                    this.bar = downloadResult
                } catch (err) {
                    console.log(err)
                }
            })
            .catch((error) => {
                this.bar = emptyResult().downloadError(error.message)
            })
    }

    setBarList = (location) => {
        const loc = location || this.location
        this.barList.downloadStarted()
        this.getBarInfo("1")
            .then((downloadResult) => {
                try {
                    this.barList = downloadResult.update((value) => [value])
                } catch (err) {
                    console.log(err)
                }
            })
            .catch((error) => {
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
