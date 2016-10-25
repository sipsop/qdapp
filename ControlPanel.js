import { React, Component, ScrollView, View, TouchableOpacity, Image, Icon, PureComponent } from './Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from './Header.js'
import { RowTextButton } from './Rows.js'
import { T } from './AppText.js'
import { store, loginStore, tabStore } from './Store.js'
import { drawerStore } from './SideMenu.js'
import { SmallOkCancelModal, SimpleModal } from './Modals.js'
import { TextSelectorRow } from './Selector.js'
import { CreditCardList } from './Payment/Checkout.js'
import { LazyComponent } from './LazyComponent.js'
import { OrderHistoryModal } from './Orders/History.js'
import { DownloadResultView, downloadManager } from './HTTP.js'
import { analytics } from './Analytics.js'
import { segment } from './Segment.js'
import { config } from './Config.js'
import { cache } from /network/cache.js'
import * as _ from './Curry.js'

const icon = (iconName, color) => <Icon name={iconName} size={25} color='rgba(255, 255, 255, 0.5)' />

const { log, assert } = _.utils('./ControlPanel.js')
assert(drawerStore != null, 'drawerStore is null')

@observer
export class ControlPanel extends PureComponent {
    render = () => {
        return <ScrollView style={{flex: 1}}>
            <LoginInfo />
            <PaymentConfig />
            <OrderHistory />
            <Settings />
            <Signout />
        </ScrollView>
    }
}

@observer
class PaymentConfig extends PureComponent {
    paymentConfigModal = null

    render = () => {
        return <View>
            <SideMenuEntry
                text="Payment"
                icon={icon("credit-card", "rgb(19, 58, 194)")}
                onPress={() => {
                    drawerStore.disable()
                    this.paymentConfigModal.show()
                    segment.track('Payment Info Viewed')
                }}
                />
            <PaymentConfigModal
                ref={ref => this.paymentConfigModal = ref}
                onClose={drawerStore.enable}
                />
        </View>
    }
}

@observer
export class PaymentConfigModal extends PureComponent {
    modal = null

    show = () => {
        this.modal.show()
    }

    render = () => {
        return (
            <SimpleModal
                    ref={ref => this.modal = ref}
                    onClose={this.props.onClose}
                    >
                <ScrollView>
                    <TextHeader
                        label="Payment Details"
                        rowHeight={55}
                        />
                    <CreditCardList />
                </ScrollView>
            </SimpleModal>
        )
    }
}

@observer
class OrderHistory extends PureComponent {
    orderHistoryModal = null

    render = () => {
        return <View>
            <SideMenuEntry
                text="History"
                icon={icon("glass", config.theme.primary.dark)}
                    onPress={() => {
                    drawerStore.disable()
                    loginStore.login(
                        () => {
                            this.orderHistoryModal.show()
                            // orderHistoryStore.fetchOrderHistory()
                            segment.track('Order History Viewed')
                        },
                        () => {
                            drawerStore.enable()
                        },
                    )
                }}
                />
            <OrderHistoryModal
                ref={ref => this.orderHistoryModal = ref}
                onClose={drawerStore.enable}
                />
        </View>
    }
}

@observer
class Settings extends PureComponent {
    settingsModal = null

    clearCache = _.logErrors(async () => {
        await cache.clearAll()
        transaction(() => {
            store.clearData()
            this.settingsModal.close()
            tabStore.setCurrentTab(0)
            drawerStore.setClosed()
        })
        segment.track('Cache Cleared')
    })

    deleteAccount = _.logErrors(async () => {
        // TODO: implement
        segment.track('Account Deleted')
    })

    render = () => {
        return <View>
            <SideMenuEntry
                text="Settings"
                icon={icon("cog", "rgba(0, 0, 0, 0.60)")}
                onPress={() => {
                    drawerStore.disable()
                    this.settingsModal.show()
                    segment.track('Settings Viewed')
                }}
                />
            <SimpleModal
                    ref={ref => this.settingsModal = ref}
                    onClose={drawerStore.enable}
                    >
                <View style={{flex: 1}}>
                    <TextHeader
                        label="Settings"
                        rowHeight={55}
                        />
                    <TextSelectorRow
                        label={"Clear Cache"}
                        onPress={this.clearCache}
                        confirmMessage="Delete any cached images, outstanding orders and related data?"
                        align='left'
                        style={{paddingLeft: 10}}
                        />
                    <TextSelectorRow
                        label={"Delete Account"}
                        onPress={this.deleteAccount}
                        confirmMessage="Are you sure you want to delete your account? This operation cannot be undone."
                        align='left'
                        style={{paddingLeft: 10}}
                        />
                </View>
            </SimpleModal>
        </View>
    }
}

@observer
class Signout extends PureComponent {
    signoutModal = null

    render = () => {
        return <View>
            {
                loginStore.isLoggedIn
                    ? <SideMenuEntry
                        text="Sign Out"
                        icon={icon("sign-out", config.theme.removeColor)}
                        onPress={() => {
                            drawerStore.disable()
                            this.signoutModal.show()
                        }}
                        />
                    : undefined
            }
            <SmallOkCancelModal
                ref={ref => this.signoutModal = ref}
                message="Sign out?"
                onConfirm={loginStore.logout}
                onClose={() => drawerStore.enable()}
                />

        </View>
    }
}

@observer
class LoginInfo extends PureComponent {
    render = () => {
        return loginStore.isLoggedIn
            ? this.renderLoggedIn()
            : this.renderLoggedOut()
    }

    renderLoggedIn = () => {
        return <View style={
                { flex: 0
                // , height: height
                , justifyContent: 'center'
                // , backgroundColor: 'rgba(24, 7, 51, 0.8)'
                // , borderBottomWidth: 0.5
                // , borderBottomColor: 'rgba(255, 255, 255, 1.0)'
                }
            }>
            <View style={{flex: 0, height: 140, justifyContent: 'center', justifyContent: 'center', alignItems: 'center'}}>
                <Image source={{uri: loginStore.picture}} style={{width: 100, height: 100}} />
            </View>
            <View style={{flex: 1, marginTop: 10, alignItems: 'center'}}>
                {/*<T>{loginStore.userName}</T>*/}
                <T numberOfLines={2} style={{fontSize: 15, color: '#fff'}}>
                    {loginStore.email}
                </T>
            </View>
            <View style={{marginTop: 20, marginBottom: 20}}>
                <BarOwnerProfile />
            </View>
        </View>
    }

    renderLoggedOut = () => {
        return <SideMenuEntry
                    text="Sign In"
                    icon={icon("sign-in")}
                    onPress={() => loginStore.login(null, null)} />
    }
}

/* Show errors for downloading the user profile of owned bars */
@observer
export class BarOwnerProfile extends DownloadResultView {
    errorMessage = "Error downloading profile info"

    styles = {
        view: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
        },
        textStyle: {
            color: '#fff',
            fontSize: 16,
        }
    }

    getDownloadResult = () => downloadManager.getDownload('barOwnerProfile')
    refreshPage = () => downloadManager.forceRefresh('barOwnerProfile')

    renderFinished = () => {
        if (!loginStore.isBarOwner)
            null
        return <View style={this.styles.view}>
            <T style={this.styles.textStyle}>
                Navigate to your bar page to control bar settings.
            </T>
        </View>
    }
}

const SideMenuEntry = props => <RowTextButton {...props} fontColor='#fff' borderBottomColor='rgba(255, 255, 255, 0.8)' />
