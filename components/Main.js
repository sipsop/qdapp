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
    Platform,
} from 'react-native'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { handleBackButton } from './AndroidBackButton.js'
import { SideMenu, MenuIcon } from './sidemenu/SideMenu.js'
import { ControlPanel } from './sidemenu/ControlPanel.js'
import { DiscoverPage } from './DiscoverPage.js'
import { BarPage } from './bar/BarPage.js'
import { MenuPage } from './menu/MenuPage.js'
import { OrderPage } from './orders/OrderPage.js'
import { TabView } from './Tabs.js'
import { Checkout } from './Payment/Checkout.js'
import { ReceiptModal } from './orders/Receipt.js'
import { Loader } from './Page.js'

import { store, barStore, tabStore, segment } from '/model/store.js'
import * as _ from '/utils/curry.js'
import { downloadManager } from '/network/http.js'

const { log, assert } = _.utils('./components/Main.js')

/* Do not allow font scaling */
Text.defaultProps.allowFontScaling = false

@observer
export class App extends Component {
    @computed get barSelected() {
        return !!barStore.barID || tabStore.currentPage !== 0
    }

    // componentWillMount = () => {
    //     StatusBar.setHidden(true)
    // }

    render = () => {
        return <View style={{flex: 1}}>
            { Platform.OS === 'ios' &&
                <StatusBar animated={false} hidden={true} barStyle="light-content" />
            }
            {this.renderApp()}
        </View>
    }

    renderApp = () => {
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
        return <SideMenu content={<ControlPanel />}>
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

require('./Downloads.js').initialize(require('/model/store.js'), downloadManager)
