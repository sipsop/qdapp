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
import { BarOrderPage } from '/components/admin/orders/BarOrderPage'

import { handleBackButton } from './components/AndroidBackButton'
import { SideMenu } from './components/sidemenu/SideMenu'
import { ControlPanel } from './components/sidemenu/ControlPanel'
import { MainTabView } from './components/tabs/MainTabView'
import { Loader } from './components/Page'
import { NotificationBar } from './components/notification/NotificationBar'
import { MenuItemModal } from '/components/menu/MenuItemModal'
import { OrderModal } from '/components/orders/OrderModal'
import { CheckoutModal } from '/components/payment/CheckoutModal'
import { PlaceOrderModal } from '/components/orders/PlaceOrder'
import { ConnectionBar } from '/components/notification/ConnectionBar'

import { store, barStore, tabStore, loginStore } from './model/store'
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
    },
    page: {
        flex: 1,
    },
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
            <View style={styles.page}>
                <ConnectionBar />
                { this.barSelected ?
                    <SideMenu content={<ControlPanel />}>
                        <NotificationBar />
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <MenuItemModal />
                            <OrderModal />
                            <CheckoutModal />
                            <PlaceOrderModal />
                            <MainTabView>
                                <View tabLabel='Discover' style={styles.page}>
                                    <DiscoverPage />
                                </View>
                                <View tabLabel='Bar' style={styles.page}>
                                    <BarPage />
                                </View>
                                <View tabLabel='Menu' style={styles.page}>
                                    <MenuPage />
                                </View>
                                {
                                    loginStore.isCurrentBarOwner &&
                                        <View tabLabel='Orders' style={styles.page}>
                                            <BarOrderPage />
                                        </View>
                                }
                            </MainTabView>
                        </View>
                    </SideMenu> :
                    <View style={styles.page}>
                        <NotificationBar />
                        <DiscoverPage />
                    </View>
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
