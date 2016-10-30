import { observable, transaction, computed, action } from 'mobx'

import { historyStore } from './historystore.js'
import { drawerStore } from './drawerstore.js'
import { analytics } from './analytics.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('./model/tabstore.js')

class TabStore {
    // ScrollableTabView
    @observable tabView = null
    @observable currentPage = 0

    constructor() {
        this.initialPage = 0
    }

    /*********************************************************************/
    /* Initialization */
    /*********************************************************************/

    getState = () => {
        return { currentPage: this.currentPage }
    }

    emptyState = () => {
        return { currentPage: 0 }
    }

    @action setState = async ({currentPage}) => {
        if (!currentPage)
            return

        this.initialPage = currentPage
        if (currentPage === 1) {
            /* NOTE: there is a bug where the Swiper in combination with
                     the scrollable tab view on the BarPage, where
                     it sometimes does not show images if we immediately
                     switch to the bar tab. So wait a little bit first...
            */
            setTimeout(() => {
                this.setCurrentTab(currentPage)
            }, 600)
        } else {
            this.setCurrentTab(currentPage)
        }
    }

    initialize = () => {

    }

    /*********************************************************************/
    /* Actions */
    /*********************************************************************/

    @action setTabView = (tabView) => {
        this.tabView = tabView
    }

    @action setCurrentTab = (i) => {
        if (this.currentPage !== i) {
            historyStore.push('tab', this.currentPage)
            this.setTab(i)
            analytics.trackTabSwitch(i)
        }
    }

    @action setTab = (i) => this.currentPage = i
}

export const tabStore = new TabStore()
historyStore.registerHandler('tab', tabStore.setTab)

_.safeAutorun(() => {
    /* Set the currentPage whenever the TabView is ready */
    if (tabStore.tabView) {
        tabStore.tabView.goToPage(tabStore.currentPage)
    }
})
