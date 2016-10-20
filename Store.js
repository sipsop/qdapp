import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'

import { emptyResult, downloadManager } from './HTTP.js'
import { cache } from './Cache.js'
import * as _ from './Curry.js'

import { favStore } from './Fav.js'
import { tabStore } from './Tabs.js'
import { barStore } from './Bar/BarStore.js'
import { barStatusStore } from './Bar/BarStatus.js'
import { orderStore } from './Orders/OrderStore.js'
import { loginStore } from './Login.js'
import { tagStore } from './Tags.js'
import { mapStore } from './Maps/MapStore.js'
import { paymentStore } from './Payment/PaymentStore.js'
import { historyStore } from './History.js'
import { segment } from './Segment.js'

const log = _.logger('Store.js')

export class Store {

    @observable initialized = false
    @observable mapVisible = true

    constructor() {
        // this.discoverScrollView = null
        this.previousState = null
        setTimeout(this.periodicallySaveToLocalStorage, 5000)
    }

    @action switchToDiscoverPage = (scrollToTop) => {
        tabStore.setCurrentTab(0)
        this.mapVisible = true
        // if (scrollToTop && this.discoverScrollView)
        //     this.discoverScrollView.scrollTo({x: 0, y: 0})
    }

    @action setMapVisible = (visible) => {
        this.mapVisible = visible
    }

    initialize = async () => {
        try {
            await this.loadFromLocalStorage()
        } catch (e) {
            _.logError(e)
        }
        this.initialized = true
        segment.initialized()
        segment.track('Application Opened', {
            from_background: true, // TODO:
            // referring_application: 'GMail',
            // url: 'url://location'
        })
        await mapStore.initialize()
        if (barStore.barID)
            await barStatusStore.periodicallyDownloadBarStatus()
    }

    loadFromLocalStorage = async () => {
        const { fromCache, value } = await cache.get('qd:state', () => null)
        if (value) {
            // log("Restoring state...", savedState)
            await this.setState(value)
        }
    }

    setState = action(async (state) => {
        if (state.payState)
            paymentStore.setState(state.payState)
        if (state.barState)
            await barStore.setState(state.barState)
        if (state.barStatusState)
            await barStatusStore.setState(state.barStatusState)
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
        if (state.segment)
            segment.setState(state.segment)
    })

    getState = () => {
        return _.asData({
            payState:       paymentStore.getState(),
            barState:       barStore.getState(),
            barStatusState: barStatusStore.getState(),
            tabState:       tabStore.getState(),
            loginState:     loginStore.getState(),
            orderState:     orderStore.getState(),
            mapState:       mapStore.getState(),
            tagState:       tagStore.getState(),
            segment:        segment.getState(),
        })
    }

    emptyState = () => {
        return {
            payState:       paymentStore.getState(),
            loginState:     loginStore.getState(),

            barState:       barStore.emptyState(),
            barStatusState: barStatusStore.emptyState(),
            tabState:       tabStore.emptyState(),
            orderState:     orderStore.emptyState(),
            mapState:       mapStore.emptyState(),
            tagState:       tagStore.emptyState(),
            segment:        segment.emptyState(),
        }
    }

    saveToLocalStorage = async (state) => {
        if (!_.deepEqual(state, this.previousState)) {
            // log(state)
            // log(this.previousState)
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
    barStatusStore,
    loginStore,
    mapStore,
    orderStore,
    tagStore,
    paymentStore,
    historyStore,
    segment,
}
