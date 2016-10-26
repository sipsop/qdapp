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

// Importing Pages 
import { DiscoverPage } from '~/screens//DiscoverPage'
import { BarPage } from '~/screens/BarPage'
import { MenuPage } from '~/screens/MenuPage'
import { OrderPage } from '~/screens/OrderPage'

import { handleBackButton } from '~/components/AndroidBackButton'
import { SideMenu, MenuIcon } from '~/components/sidemenu/SideMenu'
import { ControlPanel } from './sidemenu/ControlPanel'
import { TabView } from '~/components/Tabs'
import { Checkout } from './payment/Checkout'
import { ReceiptModal } from './orders/Receipt'
import { Loader } from '~/components/Page'

import { store, barStore, tabStore, segment } from '~/model/store'
import * as _ from '~/utils/curry'

const { log, assert } = _.utils('~/Main')

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
