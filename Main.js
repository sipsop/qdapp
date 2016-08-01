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

import { BarPage } from './BarPage.js'

export class Main extends Component {

    render = () => {
        return <ScrollableTabView renderTabBar={this.renderTabBar}>
            <Text tabLabel='Discover'>discover bars</Text>
            <ScrollView tabLabel='Bar'>
                <BarPage />
            </ScrollView>
            <Text tabLabel='Menu'>explore menu</Text>
            <Text tabLabel='Order'>review order</Text>
        </ScrollableTabView>
    }

    // renderTabBar = () => <DefaultTabBar />
    renderTabBar = () => <ScrollableTabBar />
}
