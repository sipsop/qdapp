import React, { Component } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { PureComponent } from '~/components/Component.js'
import * as _ from '~/utils/curry.js'
import { config } from '~/utils/config.js'

import { historyStore, drawerStore, tabStore } from '../model/store.js'
import { analytics } from '../network/analytics.js'

const { log, assert } = _.utils('./Tabs.js')

export class TabView extends PureComponent {
    render = () => {
        return <ScrollableTabView
                    ref={tabStore.setTabView}
                    initialPage={tabStore.initialPage}
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
