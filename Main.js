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

import { DiscoverPage } from './DiscoverPage.js'
import { BarPage } from './BarPage.js'
import { MenuPage } from './MenuPage.js'

export class Main extends Component {

    render = () => {
        return <ScrollableTabView renderTabBar={this.renderTabBar} style={{flex: 1}}>
            <View tabLabel='Discover' style={{flex: 1}}>
                <DiscoverPage />
            </View>
            <ScrollView tabLabel='Bar'>
                <BarPage />
            </ScrollView>
            <ScrollView tabLabel='Menu'>
                <MenuPage />
            </ScrollView>
            <Text tabLabel='Order'>review order</Text>
        </ScrollableTabView>
    }

    // renderTabBar = () => <DefaultTabBar />
    renderTabBar = () => <ScrollableTabBar />
}
