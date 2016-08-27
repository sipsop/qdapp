import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'
import _ from 'lodash'

import { OrderItem } from './Orders.js'
import { emptyResult, downloadManager } from './HTTP.js'
import { cache } from './Cache.js'
import { logErrors, runAndLogErrors, logError, safeAutorun } from './Curry.js'
import { orderStore } from './Orders.js'
import { favStore } from './Fav.js'
import { tabStore } from './Tabs.js'
import { barStore } from './BarStore.js'

export class Store {

    // [ lat, lon ]
    @observable location = null

    // DownloadResult[schema.Bar]
    @observable bar   = null

    // // BarID
    // @observable barID = null
    //
    // // DownloadResult[ List[schema.Bar] ]
    // @observable barList = null

    @observable menuItemOrders = null
    // @observable menuItemOrdersMap = null // observable maps don't seem to work...

    constructor() {
        // this.bar     = emptyResult()
        // this.barList = emptyResult()
        safeAutorun(() => {
            if (this.allMenuItems.length === 0)
                return
            this.setOrderList(
                this.allMenuItems.map(menuItem => [menuItem.id, []])
            )
        })
        this.discoverScrollView = null
        this.previousState = null
        setTimeout(this.saveToLocalStorage, 5000)
    }

    getOrderList = (menuItemID) => {
        for (var i = 0; i < this.menuItemOrders.length; i++) {
            const item = this.menuItemOrders[i]
            if (item[0] == menuItemID) {
                const orderList = item[1]
                return orderList
            }
        }
        throw Error(`MenuItemID ${menuItemID} (${typeof(menuItemID)}) not found`)

    }

    setOrderList = (menuItemOrders) => {
        this.menuItemOrders = menuItemOrders
    }

    switchToDiscoverPage = (scrollToTop) => {
        tabStore.setCurrentTab(0)
        if (scrollToTop && this.discoverScrollView)
            this.discoverScrollView.scrollTo({x: 0, y: 0})
    }

    initialize = logErrors(async () => {
        await this.loadFromLocalStorage()
        await barStore.initialize()
    })

    @computed get allMenuItems() {
        const bar = barStore.getBar()
        if (!bar || !bar.menu)
            return []

        const menu  = barStore.getBar().menu
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
            const orderItems = this.getOrderList(menuItem.id)
            return orderItems.length > 0
        })
    }

    loadFromLocalStorage = async () => {
        const savedState = await cache.get('qd:state', () => null)
        if (savedState) {
            console.log("Restoring state...", savedState)
            await this.setState(savedState)
        }
    }

    setState = action(async (state) => {
        await barStore.setState(state)
        await tabStore.setState(state)
        if (state.orderState) {
            orderStore.setState(state.orderState)
        }
    })

    getState = () => {
        return {
            ...barStore.getState(),
            orderState: orderStore.getState(),
            ...tabStore.getState(),
        }
    }

    saveToLocalStorage = logErrors(async () => {
        const state = this.getState()
        if (!_.isEqual(state, this.previousState)) {
            console.log("Saving state...", state)
            this.previousState = state
            await cache.set('qd:state', state)
        }
        setTimeout(this.saveToLocalStorage, 3000)
    })
}

const popup = (title, message) => Alert.alert(title, message)

export const store = new Store()
export { favStore, tabStore, barStore }
