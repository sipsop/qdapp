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
import { store } from './Store.js'

@observer export class Main extends Component {

    render = () => {
        return <ScrollableTabView
                ref={(tabView) => { store.tabView = tabView }}
                renderTabBar={this.renderTabBar}
                style={{flex: 1}}
                /* NOTE: This is buggy, do not use! */
                /*page={store.currentTab}*/
                >
            <View tabLabel='Discover' style={{flex: 1}}>
                <DiscoverPage />
            </View>
            <ScrollView tabLabel='Bar' /* contentContainerStyle={{flex: 1}} */>
                <BarPage />
            </ScrollView>
            <ScrollView tabLabel='Menu' style={{flex: 1}}>
                <MenuPage />
            </ScrollView>
            <Text tabLabel='Order'>review order</Text>
        </ScrollableTabView>
    }

    // renderTabBar = () => <DefaultTabBar />
    renderTabBar = () => <ScrollableTabBar />
}
