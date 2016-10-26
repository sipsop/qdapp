import { observable, action } from 'mobx'

import { downloadManager } from '~/network/http'
import { cache } from '~/network/cache.js'
import { segment } from '~/network/segment.js'
import * as _ from '~/utils/curry.js'

import { analytics } from './analytics.js'
import { favStore } from './favstore.js'
import { tabStore } from './tabstore.js'
import { barStore } from './barstore.js'
import { barStatusStore } from './barstatusstore.js'
import { loginStore } from './loginstore.js'
import { tagStore } from './tagstore.js'
import { mapStore } from './mapstore.js'
import { orderStore } from './orders/orderstore.js'
import { paymentStore } from './orders/paymentstore.js'
import { historyStore } from './historystore.js'
import { timeStore } from './timestore.js'
import { drawerStore } from './drawerstore.js'

const log = _.logger('./model/store.js')

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
        /* First call initialize() */
        await analytics.initialize()
        await favStore.initialize()
        await tabStore.initialize()
        await barStore.initialize()
        await barStatusStore.initialize()
        await loginStore.initialize()
        await tagStore.initialize()
        await mapStore.initialize()
        await orderStore.initialize()
        await paymentStore.initialize()
        await historyStore.initialize()
        await timeStore.initialize()
        await segment.initialize()

        try {
            await this.loadFromLocalStorage()
        } catch (e) {
            _.logError(e)
        }
        this.initialized = true

        /* Then call initialized() */
        await mapStore.initialized()
        await segment.initialized()
        await downloadManager.initialized()
        segment.track('Application Opened', {
            from_background: true, // TODO:
            // referring_application: 'GMail',
            // url: 'url://location'
        })
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
        if (state.downloadManagerState)
            downloadManager.setState(state.downloadManagerState)
    })

    getState = () => {
        return _.asData({
            payState:               paymentStore.getState(),
            barState:               barStore.getState(),
            barStatusState:         barStatusStore.getState(),
            tabState:               tabStore.getState(),
            loginState:             loginStore.getState(),
            orderState:             orderStore.getState(),
            mapState:               mapStore.getState(),
            tagState:               tagStore.getState(),
            segment:                segment.getState(),
            downloadManagerState:   downloadManager.getState(),
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
            mapState:               mapStore.emptyState(),
            tagState:               tagStore.emptyState(),
            segment:                segment.emptyState(),
            downloadManagerState:   downloadManagerState.emptyState(),
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
    historyStore,
    timeStore,
    segment,
    drawerStore,
}
