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
import { loginStore } from './Login.js'

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
            if (barStore.allMenuItems.length === 0)
                return
            this.setOrderList(
                barStore.allMenuItems.map(menuItem => [menuItem.id, []])
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

    @computed get menuItemsOnOrder() {
        return barStore.allMenuItems.filter(menuItem => {
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
        if (state.barState)
            await barStore.setState(state.barState)
        if (state.tabState)
            await tabStore.setState(state.tabState)
        if (state.loginState)
            loginStore.setState(state.loginState)
        if (state.orderState)
            orderStore.setState(state.orderState)
    })

    getState = () => {
        return {
            barState: barStore.getState(),
            tabState: tabStore.getState(),
            loginState: loginStore.getState(),
            orderState: orderStore.getState(),
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
export { favStore, tabStore, barStore, loginStore }
