import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'

import { emptyResult, downloadManager } from './HTTP.js'
import { cache } from './Cache.js'
import * as _ from './Curry.js'

import { favStore } from './Fav.js'
import { tabStore } from './Tabs.js'
import { barStore } from './Bar/BarStore.js'
import { orderStore } from './Orders/OrderStore.js'
import { loginStore } from './Login.js'
import { mapStore } from './Maps/MapStore.js'
import { paymentStore } from './Payment/PaymentStore.js'

const log = _.logger('Store.js')

export class Store {

    constructor() {
        this.discoverScrollView = null
        this.previousState = null
        setTimeout(this.saveToLocalStorage, 5000)
    }

    switchToDiscoverPage = (scrollToTop) => {
        tabStore.setCurrentTab(0)
        if (scrollToTop && this.discoverScrollView)
            this.discoverScrollView.scrollTo({x: 0, y: 0})
    }

    initialize = _.logErrors(async () => {
        await Promise.all(
            this.loadFromLocalStorage(),
            barStore.initialize(),
            mapStore.initialize(),
        )
    })

    loadFromLocalStorage = async () => {
        const savedState = await cache.get('qd:state', () => null)
        if (savedState) {
            // log("Restoring state...", savedState)
            await this.setState(savedState)
        }
    }

    setState = action(async (state) => {
        if (state.payState)
            paymentStore.setState(state.payState)
        if (state.barState)
            await barStore.setState(state.barState)
        if (state.tabState)
            await tabStore.setState(state.tabState)
        if (state.loginState)
            loginStore.setState(state.loginState)
        if (state.orderState)
            orderStore.setState(state.orderState)
        if (state.mapState)
            mapStore.setState(state.mapState)
    })

    getState = () => {
        return _.asData({
            payState:   paymentStore.getState(),
            barState:   barStore.getState(),
            tabState:   tabStore.getState(),
            loginState: loginStore.getState(),
            orderState: orderStore.getState(),
            mapState:   mapStore.getState(),
        })
    }

    saveToLocalStorage = _.logErrors(async () => {
        const state = this.getState()
        if (!_.deepEqual(state, this.previousState)) {
            log("Saving state now...", state)
            this.previousState = state
            await cache.set('qd:state', state)
        }
        setTimeout(this.saveToLocalStorage, 1000)
    })
}

const popup = (title, message) => Alert.alert(title, message)

export const store = new Store()
export { favStore, tabStore, barStore, loginStore, mapStore, orderStore }
