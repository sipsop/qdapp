import { observable, transaction, computed, autorun, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'
import { emptyResult, downloadManager } from './HTTP.js'
import { cache } from './Cache.js'
import { logErrors, logError } from './Curry.js'
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

    // ScrollableTabView
    @observable tabView = null
    @observable currentPage = 0
    @observable initialized = true

    @observable menuItemOrders = null
    // @observable menuItemOrdersMap = null // observable maps don't seem to work...

    constructor() {
        this.bar     = emptyResult()
        this.barList = emptyResult()
        autorun(() => {
            const menuItems = this.allMenuItems
            if (menuItems.length === 0)
                return
            this.menuItemOrders = menuItems.map(menuItem => [menuItem.id, []])
            this.menuItemOrdersMap = new Map(this.menuItemOrders)
        })
        autorun(() => {
            /* Set the currentPage whenever the TabView is ready */
            if (this.tabView)
                this.tabView.goToPage(this.currentPage)
        })
        this.discoverScrollView = null
    }

    canSetTab = () => !!this.tabView

    @action setCurrentTab = (i) => {
        this.currentPage = i
    }

    switchToDiscoverPage = (scrollToTop) => {
        this.setCurrentTab(0)
        if (scrollToTop)
            this.discoverScrollView.scrollTo({x: 0, y: 0})
    }

    // Stupid binding issue... Make sure this is bound on access
    initialize = () => {
        this._initialize()
        autorun(() => {
            if (this.initialized)
                this.saveToLocalStorage()
        })
    }

    async _initialize() {
        try {
            await this.loadFromLocalStorage()
            await this.setBarList()
            // Wait 5 seconds before saving any changes to disk
            setTimeout(() => {
                this.initialized = true
            }, 5000)
        } catch (err) {
            logError(err)
        }
    }

    @computed get allMenuItems() {
        const bar = this.bar.value
        if (!bar || !bar.menu)
            return []

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

    async getBarInfo(barID, menu) {
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

            key = `qd:bar=${barID}:menu=${menu}`
            if (menuQuery)
                query += fragments

            isRelevant = () => barID === this.barID
            const downloadResult = await downloadManager.graphQL(
                key, query, isRelevant)
            return downloadResult.update((data) => data.bar)
    }

    async setBarID(barID) {
        if (this.bar.value && this.bar.value.id === barID)
            return /* All done */

        transaction(() => {
            this.bar = emptyResult().downloadStarted()
            this.barID = barID
        })

        const downloadResult = await this.getBarInfo(barID, true)
        logErrors(() => {
            if (this.barID === barID) {
                /* NOTE: a user may have selected a different bar
                         before this download has completed, in
                         which case we should ignore the download.
                */
                this.bar = downloadResult
            }
        })
    }

    async setBarList(location) {
        const loc = location || this.location
        this.barList.downloadStarted()
        const downloadResult = await this.getBarInfo("1")
        logErrors(() => {
            this.barList = downloadResult.update((value) => [value])
        })
    }

    async loadFromLocalStorage() {
        const defaultState = {
            barID: null,
            currentPage: 0,
        }
        const savedState = await cache.get('qd:state', () => defaultState)
        if (savedState) {
            this.restoreState(savedState)
        }
    }

    async restoreState(state) {
        if (state.barID) {
            await this.setBarID(state.barID)
        }
        if (state.currentPage != undefined)
            this.setCurrentTab(state.currentPage)
    }

    async saveToLocalStorage() {
        const state = {
            barID: this.barID,
            currentPage: this.currentPage,
        }
        await cache.set('qd:state', state)
    }
}

const popup = (title, message) => Alert.alert(title, message)

export const store = new Store()
