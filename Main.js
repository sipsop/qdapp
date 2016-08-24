import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native'
import _ from 'lodash'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { observer } from 'mobx-react/native'

import { DiscoverPage } from './DiscoverPage.js'
import { BarPage } from './BarPage.js'
import { MenuPage } from './MenuPage.js'
import { OrderPage } from './OrderPage.js'
import { store } from './Store.js'
import { cache } from './Cache.js'

@observer export class Main extends Component {

    render = () => {
        return <ScrollableTabView
                ref={(tabView) => { store.tabView = tabView }}
                renderTabBar={this.renderTabBar}
                style={{flex: 1}}
                scrollWithoutAnimation={true}
                /* NOTE: This is buggy, do not use! */
                /*page={store.currentTab}*/
                onChangeTab={
                    changeEvent => {
                        // store.currentPage = changeEvent.i
                        console.log("CHANGE EVENT")
                        store.setCurrentTab(changeEvent.i)
                    }
                }>
            <View tabLabel='Discover' style={{flex: 1}}>
                <DiscoverPage />
            </View>
            <View tabLabel='Bar' style={{flex: 1}}>
                <BarPage />
            </View>
            <View tabLabel='Menu' style={{flex: 1}}>
                <MenuPage />
            </View>
            <View tabLabel='Order' style={{flex: 1}}>
                <OrderPage />
            </View>
        </ScrollableTabView>
    }

    // renderTabBar = () => <DefaultTabBar />
    renderTabBar = () => <ScrollableTabBar />
}
