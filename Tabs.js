import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { safeAutorun } from './Curry.js'

@observer
export class TabView extends PureComponent {
    render = () => {
        return <ScrollableTabView
                    ref={tabStore.setTabView}
                    renderTabBar={this.renderTabBar}
                    style={{flex: 1}}
                    scrollWithoutAnimation={true}
                    /* NOTE: This is buggy, do not use! */
                    /*page={store.currentTab}*/
                    onChangeTab={
                        changeEvent => {
                            tabStore.setCurrentTab(changeEvent.i)
                        }
                    }>
            {this.props.children}
        </ScrollableTabView>
    }
}

class TabStore {
    // ScrollableTabView
    @observable tabView = null
    @observable currentPage = 0

    constructor() {
        this.history = []
    }

    @action setTabView = (tabView) => {
        this.tabView = tabView
    }

    @action setCurrentTab = (i) => {
        if (this.currentPage !== i) {
            this.history.push(this.currentPage)
            this.currentPage = i
        }
    }

    @action gotoPreviousTab = () => {
        if (this.history.length) {
            this.currentPage = this.history.pop()
        }
    }

    getState = () => {
        return { currentPage: this.currentPage }
    }

    @action setState = async ({currentPage}) => {
        if (!currentPage)
            return

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

}

export const tabStore = new TabStore()

safeAutorun(() => {
    /* Set the currentPage whenever the TabView is ready */
    if (tabStore.tabView)
        tabStore.tabView.goToPage(tabStore.currentPage)
})
