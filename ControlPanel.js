import { React, Component, ScrollView, View, TouchableOpacity, Image, Icon, PureComponent } from './Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { RowTextButton } from './Rows.js'
import { T } from './AppText.js'
import { store, loginStore, tabStore } from './Store.js'
import { drawerStore } from './SideMenu.js'
import { SmallOkCancelModal, SimpleModal } from './Modals.js'
import { TextSelectorRow } from './Selector.js'
import { CreditCardList } from './Payment/PaymentModal.js'
import { LazyComponent } from './LazyComponent.js'
import { config } from './Config.js'
import { cache } from './Cache.js'
import * as _ from './Curry.js'

const icon = (iconName, color="#000") => <Icon name={iconName} size={30} color={color} />

const { log, assert } = _.utils('./ControlPanel.js')
assert(drawerStore != null, 'drawerStore is null')


@observer
export class ControlPanel extends PureComponent {
    render = () => {
        return <View style={{flex: 1}}>
            <LoginInfo />
            <RowTextButton text="Recent Orders" icon={icon("glass", config.theme.primary.dark)} />
            <PaymentConfig />
            <Settings />
            <Signout />
        </View>
    }
}

@observer
class PaymentConfig extends PureComponent {
    paymentModal = null

    render = () => {
        return <View>
            <RowTextButton text="Payment"
                icon={icon("credit-card", "rgb(19, 58, 194)")}
                onPress={() => {
                    drawerStore.disable()
                    this.paymentModal.show()
                }}
                />
            <SimpleModal
                    ref={ref => this.paymentModal = ref}
                    onClose={drawerStore.enable}
                    >
                <ScrollView>
                    <CreditCardList />
                </ScrollView>
            </SimpleModal>
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
    })

    render = () => {
        return <View>
            <RowTextButton
                text="Settings"
                icon={icon("cog", "rgba(0, 0, 0, 0.60)")}
                onPress={() => {
                    drawerStore.disable()
                    this.settingsModal.show()
                }}
                />
            <SimpleModal
                    ref={ref => this.settingsModal = ref}
                    onClose={drawerStore.enable}
                    >
                <LazyComponent style={{flex: 1}}>
                    <TextSelectorRow
                        label={"Clear Cache"}
                        onPress={this.clearCache}
                        confirmMessage="Delete any cached images, outstanding orders and related data?"
                        />
                    <TextSelectorRow
                        label={"Delete Account"}
                        onPress={this.clearCache}
                        confirmMessage="Are you sure you want to delete your account? This operation cannot be undone."
                        />
                </LazyComponent>
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
                    ? <RowTextButton
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
        return <View style={{flex: 0, height: 200, justifyContent: 'center', backgroundColor: '#000'}}>
            <View style={{flex: 0, height: 140, justifyContent: 'center', justifyContent: 'center', alignItems: 'center'}}>
                <Image source={{uri: loginStore.picture}} style={{width: 100, height: 100}} />
            </View>
            <View style={{flex: 1, marginTop: 10, alignItems: 'center'}}>
                {/*<T>{loginStore.userName}</T>*/}
                <T numberOfLines={2} style={{fontSize: 15, color: '#fff'}}>
                    {loginStore.email}
                </T>
            </View>
        </View>
    }

    renderLoggedOut = () => {
        return <RowTextButton
                    text="Sign In"
                    icon={icon("sign-in")}
                    onPress={loginStore.login}
                    />

    }
}
