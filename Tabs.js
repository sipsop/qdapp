import React, { Component } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { PureComponent } from './Component.js'
import { safeAutorun } from './Curry.js'
import { config } from './Config.js'
import { drawerStore } from './SideMenu.js'

@observer
export class TabView extends PureComponent {
    render = () => {
        console.log("RENDERING TAB VIEW")
        return <ScrollableTabView
                    ref={tabStore.setTabView}
                    renderTabBar={() => <TabBarWithMenu />}
                    style={{flex: 1}}
                    scrollWithoutAnimation={true}
                    tabBarUnderlineColor={config.theme.primary.medium}
                    tabBarActiveTextColor={config.theme.primary.medium}
                    /*
                    tabBarInactiveTextColor={config.theme.primary.dark}
                    tabBarBackgroundColor="#000"
                    */
                    tabBarTextStyle={{marginTop: 4, fontSize: 16, textAlign: 'center'}}
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

@observer
class TabBarWithMenu extends PureComponent {
    /* properties:
        containerWidth
        other properties (see scrollable tab view docs)
    */
    render = () => {
        const marginLeft = 15
        const marginRight = 15
        const iconSize = 30
        const containerWidth = this.props.containerWidth - (marginLeft + marginRight + iconSize)
        return <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={drawerStore.toggleOpenClose}>
                <View style={{flex: 1, justifyContent: 'center', marginLeft: marginLeft, marginRight: marginRight}}>
                    <Icon name="bars" size={30} color="#000" />
                </View>
            </TouchableOpacity>

            <View style={{flex: 1}}>
                <DefaultTabBar
                    {...this.props}
                    containerWidth={containerWidth}
                    />
            </View>
        </View>
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
