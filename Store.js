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
import { tagStore } from './Tags.js'
import { mapStore } from './Maps/MapStore.js'
import { paymentStore } from './Payment/PaymentStore.js'

const log = _.logger('Store.js')

export class Store {

    constructor() {
        this.discoverScrollView = null
        this.previousState = null
        setTimeout(this.periodicallySaveToLocalStorage, 5000)
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
        if (state.tagState)
            tagStore.setState(state.tagState)
    })

    getState = () => {
        return _.asData({
            payState:   paymentStore.getState(),
            barState:   barStore.getState(),
            tabState:   tabStore.getState(),
            loginState: loginStore.getState(),
            orderState: orderStore.getState(),
            mapState:   mapStore.getState(),
            tagState:   tagStore.getState(),
        })
    }

    emptyState = () => {
        return {
            payState:   paymentStore.getState(),
            loginState: loginStore.getState(),

            barState:   barStore.emptyState(),
            tabState:   tabStore.emptyState(),
            orderState: orderStore.emptyState(),
            mapState:   mapStore.emptyState(),
            tagState:   tagStore.emptyState(),
        }
    }

    saveToLocalStorage = async (state) => {
        if (!_.deepEqual(state, this.previousState)) {
            log("Saving state now...")
            this.previousState = state
            await cache.set('qd:state', state)
        }
    }

    periodicallySaveToLocalStorage = _.logErrors(async () => {
        const state = this.getState()
        await this.saveToLocalStorage(state)
        setTimeout(this.periodicallySaveToLocalStorage, 1000)
    })

    @action clearData = () => {
        const emptyState = this.emptyState()
        this.setState(emptyState)
        // await this.saveToLocalStorage(emptyState)
    }
}

const popup = (title, message) => Alert.alert(title, message)

export const store = new Store()
export {
    favStore,
    tabStore,
    barStore,
    loginStore,
    mapStore,
    orderStore,
    tagStore,
    paymentStore,
}
