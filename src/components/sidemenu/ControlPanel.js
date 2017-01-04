import { React, Component, ScrollView, View, TouchableOpacity, Image,
         Icon, MaterialIcon, PureComponent, T, StyleSheet,
} from '/components/Component'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'
import { phonecall, email, web } from 'react-native-communications'

import { themedRefreshControl } from '/components/SimpleListView'
import { TextHeader } from '../Header.js'
import { RowTextButton } from '../Rows.js'
import { SmallOkCancelModal, SimpleModal, MarkdownModal } from '../Modals.js'
import { TextSelectorRow } from '../Selector.js'
import { LazyComponent } from '../LazyComponent.js'
import { PaymentConfigModal } from '../payment/PaymentConfigModal.js'
import { OrderHistoryModal } from '../orders/History.js'
import { AdminBarListModal } from '../bar/AdminBarListModal'
import { ConnectionBar } from '/components/notification/ConnectionBar'

import { downloadManager } from '/network/http.js'
import { DownloadResultView } from '../download/DownloadResultView'
import { store, loginStore, tabStore, drawerStore, modalStore, messageStore } from '/model/store.js'
import { analytics } from '/model/analytics.js'
import { segment } from '/network/segment.js'
import { config } from '/utils/config.js'
import { cache } from '/network/cache.js'
import * as _ from '/utils/curry.js'

const icon = (iconName, color, IconType = Icon) => {
    return (
        <IconType
            name={iconName}
            size={25}
            color='rgba(255, 255, 255, 0.5)'
            />
    )
}

const { log, assert } = _.utils('/components/sidemenu/ControlPanel.js')
assert(drawerStore != null, 'drawerStore is null')

@observer
export class ControlPanel extends PureComponent {
    /* TODO: Factor out this refresh stuff into something reusable */
    @observable refreshing = false

    handleRefresh = () => {
        this.refreshing = true
        transaction(async () => {
            loginStore.refreshUserProfile()
            this.refreshing = false
        })
    }

    getRefreshControl = () => {
        return themedRefreshControl({
            refreshing: this.refreshing,
            onRefresh:  this.handleRefresh,
        })
    }

    render = () => {
        return (
            <ScrollView
                style={{flex: 1}}
                refreshControl={this.getRefreshControl()}
                >
                <LoginInfo />
                {loginStore.isBarOwner && <AdminBarList />}
                <PaymentConfig />
                <OrderHistory />
                <Settings />
                {/*<Feedback />*/}
                <Signout />
            </ScrollView>
        )
    }
}

@observer
class AdminBarList extends PureComponent {
    barListModal = null

    @action closeDrawer = () => {
        drawerStore.enable()
        drawerStore.setClosed()
    }

    render = () => {
        return (
            <View>
                <SideMenuEntry
                    text="Bar Admin"
                    icon={icon("user", "rgb(19, 58, 194)")}
                    onPress={() => {
                        drawerStore.disable()
                        this.barListModal.show()
                        segment.track('Payment Info Viewed')
                    }}
                    />
                <AdminBarListModal
                    ref={ref => this.barListModal = ref}
                    onClose={this.closeDrawer}
                    />
            </View>
        )
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

const settingsStyles = StyleSheet.create({
    textRow: {
        paddingLeft: 10,
    }
})

@observer
class Settings extends PureComponent {
    settingsModal           = null
    termsAndConditionsModal = null
    privacyPolicyModal      = null

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
                <ConnectionBar />
                <MarkdownModal
                    ref={ref => this.termsAndConditionsModal = ref}
                    header="Terms and Conditions"
                    url="https://qdodger.com/TermsAndConditions.md"
                    />
                <MarkdownModal
                    ref={ref => this.privacyPolicyModal= ref}
                    header="Privacy Policy"
                    url="https://qdodger.com/PrivacyPolicy.md"
                    />
                <View style={{flex: 1}}>
                    <TextHeader
                        label="Settings"
                        rowHeight={55}
                        />
                    <TextSelectorRow
                        label={`App Version: ${config.appVersion}`}
                        onPress={undefined}
                        align='left'
                        style={settingsStyles.textRow}
                        />
                    <TextSelectorRow
                        label="Feedback"
                        onPress={feedback}
                        align='left'
                        style={settingsStyles.textRow}
                        />
                    <TextSelectorRow
                        label="Terms and Conditions"
                        onPress={() => {
                            this.termsAndConditionsModal.show()
                        }}
                        align='left'
                        style={settingsStyles.textRow}
                        />
                    <TextSelectorRow
                        label={`Privacy Policy`}
                        onPress={() => {
                            this.privacyPolicyModal.show()
                        }}
                        align='left'
                        style={settingsStyles.textRow}
                        />
                    <TextSelectorRow
                        label={"Clear Cache"}
                        onPress={this.clearCache}
                        confirmMessage="Delete any cached images, outstanding orders and related data?"
                        align='left'
                        style={settingsStyles.textRow}
                        />
                    <TextSelectorRow
                        label={"Delete Account"}
                        onPress={this.deleteAccount}
                        confirmMessage="Are you sure you want to delete your account? This operation cannot be undone."
                        align='left'
                        style={settingsStyles.textRow}
                        />
                </View>
            </SimpleModal>
        </View>
    }
}

// @observer
// class Feedback extends PureComponent {
//     render = () => {
//         return <SideMenuEntry
//                     text="Feedback"
//                     icon={icon("envelope", "rgba(0, 0, 0, 0.60)")}
//                     onPress={feedback} />
//     }
// }

const feedback = () => {
    email(
        ['hello@qdodger.com'],
        null,       /* cc */
        null,       /* bcc */
        'feedback', /* subject */
        null,       /* body */
    )
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

    getDownloadResult = loginStore.getUserProfileDownload
    refreshPage = loginStore.refreshUserProfile

    renderFinished = () => {
        if (!loginStore.isBarOwner)
            return null
        return <View style={this.styles.view}>
            <T style={this.styles.textStyle}>
                Navigate to your bar page to control bar settings.
            </T>
        </View>
    }
}

const SideMenuEntry = props => <RowTextButton {...props} fontColor='#fff' borderBottomColor='rgba(255, 255, 255, 0.8)' />
