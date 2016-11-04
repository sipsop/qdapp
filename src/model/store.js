import { observable, action } from 'mobx'

import { downloadManager } from '/network/http'
import { cache } from '/network/cache'
import { segment } from '/network/segment'
import * as _ from '/utils/curry'

import { analytics } from './analytics'
import { favStore } from './favstore'
import { tabStore } from './tabstore'
import { barStore } from './barstore'
import { barStatusStore } from './barstatusstore'
import { loginStore } from './loginstore'
import { tagStore } from './tagstore'
import { mapStore } from './mapstore'
import { orderStore } from './orders/orderstore'
import { paymentStore } from './orders/paymentstore'
import { orderStatusStore } from './orders/orderstatusstore'
import { historyStore } from './historystore'
import { timeStore } from './timestore'
import { drawerStore } from './drawerstore'
import { searchStore } from './searchstore'

import { notificationStore } from './notificationstore'

const log = _.logger('./model/store')

export class Store {

    @observable initialized = false
    @observable mapVisible = true

    constructor() {
        this.discoverScrollView = null
        this.previousState = null
        setTimeout(this.periodicallySaveToLocalStorage, 5000)
    }

    @action switchToDiscoverPage = (scrollToTop = false) => {
        tabStore.setCurrentTab(0)
        this.mapVisible = true
        if (scrollToTop && this.discoverScrollView) {
            log("SCROLLING TO TOP!")
            this.discoverScrollView.scrollToTop()
        }
    }

    @action setMapVisible = (visible) => {
        this.mapVisible = visible
    }

    initialize = async () => {
        /* First call initialize() */
        await Promise.all([
            analytics.initialize(),
            favStore.initialize(),
            tabStore.initialize(),
            barStore.initialize(),
            barStatusStore.initialize(),
            loginStore.initialize(),
            tagStore.initialize(),
            mapStore.initialize(),
            orderStore.initialize(),
            paymentStore.initialize(),
            orderStatusStore.initialize(),
            historyStore.initialize(),
            timeStore.initialize(),
            segment.initialize(),
        ])

        try {
            await this.loadFromLocalStorage()
        } catch (e) {
            _.logError(e)
        }

        /* Then call initialized() */
        await Promise.all([
            mapStore.initialized(),
            segment.initialized(),
            downloadManager.initialized(),
            orderStatusStore.initialized(),
            loginStore.initialized(),
        ])

        segment.track('Application Opened', {
            from_background: true, // TODO:
            // referring_application: 'GMail',
            // url: 'url://location'
        })

        this.initialized = true
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
        if (state.orderStatusState)
            orderStatusStore.setState(state.orderStatusState)
        if (state.mapState)
            mapStore.setState(state.mapState)
        if (state.tagState)
            tagStore.setState(state.tagState)
        if (state.segment)
            segment.setState(state.segment)
        if (state.downloadManagerState)
            downloadManager.setState(state.downloadManagerState)
        if (state.searchState)
            searchStore.setState(state.searchState)
    })

    getState = () => {
        return _.asData({
            payState:               paymentStore.getState(),
            barState:               barStore.getState(),
            barStatusState:         barStatusStore.getState(),
            tabState:               tabStore.getState(),
            loginState:             loginStore.getState(),
            orderState:             orderStore.getState(),
            orderStatusState:       orderStatusStore.getState(),
            mapState:               mapStore.getState(),
            tagState:               tagStore.getState(),
            segment:                segment.getState(),
            downloadManagerState:   downloadManager.getState(),
            searchState:            searchStore.getState(),
        })
    }

    emptyState = () => {
        return {
            payState:               paymentStore.getState(),
            loginState:             loginStore.getState(),

            barState:               barStore.emptyState(),
            barStatusState:         barStatusStore.emptyState(),
            tabState:               tabStore.emptyState(),
            orderState:             orderStore.emptyState(),
            orderStatusState:       orderStatusStore.emptyState(),
            mapState:               mapStore.emptyState(),
            tagState:               tagStore.emptyState(),
            segment:                segment.emptyState(),
            downloadManagerState:   downloadManager.emptyState(),
        }
    }

    saveToLocalStorage = async (state) => {
        if (this.initialized && !_.deepEqual(state, this.previousState)) {
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

export const store = new Store()

export {
    analytics,
    favStore,
    tabStore,
    barStore,
    barStatusStore,
    loginStore,
    tagStore,
    mapStore,
    orderStore,
    paymentStore,
    orderStatusStore,
    historyStore,
    timeStore,
    segment,
    drawerStore,
    notificationStore,
    searchStore
}
