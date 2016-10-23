import React, { Component } from 'react'
import {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ListView,
    TouchableOpacity,
    StatusBar,
} from 'react-native'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { handleBackButton } from './AndroidBackButton.js'
import { SideMenu, MenuIcon } from './SideMenu.js'
import { ControlPanel } from './ControlPanel.js'
import { DiscoverPage } from './DiscoverPage.js'
import { BarPage } from './Bar/BarPage.js'
import { MenuPage } from './Menu/MenuPage.js'
import { OrderPage } from './Orders/OrderPage.js'
import { TabView } from './Tabs.js'
import { store, barStore, tabStore, segment } from './Store.js'
import { cache } from './Cache.js'
import * as _ from './Curry.js'
import { Checkout } from './Payment/Checkout.js'
import { ReceiptModal } from './Orders/Receipt.js'
import { Loader } from './Page.js'
import { downloadManager } from './HTTP.js'

const { log, assert } = _.utils('./Main.js')

@observer
export class App extends Component {
    @computed get barSelected() {
        return !!barStore.barID || tabStore.currentPage !== 0
    }

    render = () => {
        if (!store.initialized)
            return <Loader />
        if (!this.barSelected)
            return <DiscoverPage />
        return <Main />
    }
}

@observer
class Main extends Component {

    render = () => {
        return  <SideMenu content={<ControlPanel />}>
            {/*<StatusBar hidden={true} />*/}
            <View style={{flex: 1, flexDirection: 'row'}}>
                {/*
                <Checkout />
                <ReceiptModal />
                */}
                <TabView>
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
                </TabView>
            </View>
        </SideMenu>
    }

    // renderTabBar = () => <DefaultTabBar />
    renderTabBar = () => <ScrollableTabBar />
}

log("----------------------------------------------------------------")

// Promise.onPossiblyUnhandledRejection(function(error){
//     throw error
// })

// By default the choice is not to propogate errors from Promises...
require('promise/setimmediate/rejection-tracking').enable({
    allRejections: true,
    onUnhandled: (id, error) => {
        console.error(error)
    }
})

export const main = async () => {
    handleBackButton()
    await store.initialize()
}

require('./Downloads.js').initialize(require('./Store.js'), downloadManager)
