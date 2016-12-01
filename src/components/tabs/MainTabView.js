import { React, Component, PureComponent, View, TouchableOpacity, Icon } from '/components/Component.js'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

import { TabView } from './TabView'
import { drawerStore, tabStore } from '/model/store'

const { log, assert } = _.utils('/components/MainTabView')

export class MainTabView extends PureComponent {
    // componentDidMount = () => {
    //     tabStore.setCurrentTab(tabStore.currentPage)
    // }

    render = () => {
        return (
            <TabView
                getRef={tabStore.setTabView}
                initialPage={tabStore.initialPage}
                renderTabBar={() => <TabBarWithMenu />}
                /* NOTE: This is buggy, do not use! */
                /*page={store.currentTab}*/
                onChangeTab={
                    changeEvent => {
                        tabStore.setCurrentTab(changeEvent.i)
                    }
                }>
                {this.props.children}
            </TabView>
        )
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
