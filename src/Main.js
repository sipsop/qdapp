import React, { Component } from 'react'
import {
    Text,
    View,
    Image
} from 'react-native'
import { ScrollableTabBar }
       from 'react-native-scrollable-tab-view'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

// Importing Pages
import { DiscoverPage } from './screens//DiscoverPage'
import { BarPage } from './screens/BarPage'
import { MenuPage } from './screens/MenuPage'
import { OrderPage } from './screens/OrderPage'

import { handleBackButton } from './components/AndroidBackButton'
import { SideMenu } from './components/sidemenu/SideMenu'
import { ControlPanel } from './components/sidemenu/ControlPanel'
import { TabView } from './components/Tabs'
import { Loader } from './components/Page'
import { NotificationBar } from './components/notification/NotificationBar'

import { store, barStore, tabStore } from './model/store'
import * as _ from './utils/curry'

const { log, assert } = _.utils('/Main')

/* Do not allow font scaling */
Text.defaultProps.allowFontScaling = false

const styles = {
    title: {
        color: '#E72D6B',
        fontWeight: 'bold'
    },
    searchIcon: {
        width: 30,
        height: 30
    }
}

@observer
export class Main extends Component {
    static route = {
        navigationBar: {
            title: 'QDodger',
            backgroundColor: '#fff',
            titleStyle: styles.title
        }
    }

    @computed get barSelected () {
        return !!barStore.barID || tabStore.currentPage !== 0
    }

    render = () => {
        if (!store.initialized) {
            return <Loader />
        }
        if (!this.barSelected) {
            return <DiscoverPage />
        }
        return (
            <View style={{flex: 1}}>
                <NotificationBar />
                { this.barSelected ?
                    <SideMenu content={<ControlPanel />}>
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
                    </SideMenu> :
                    <DiscoverPage />
                }
            </View>
        )
    }

    // renderTabBar = () => <DefaultTabBar />
    // renderTabBar = () => <ScrollableTabBar />
}

log('----------------------------------------------------------------')

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

/* Initialize

Note: Do not initialize in componentDidMount, as it may be called multiple times.
*/
handleBackButton()
store.initialize()
