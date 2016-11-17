import { React, Component, View, TouchableOpacity, PureComponent, Platform, T } from '/components/Component.js'
import { observer } from 'mobx-react/native'
import {
  NavigationProvider,
  StackNavigation
} from '@exponent/ex-navigation'
import FCM from 'react-native-fcm'

import { Router } from './Router'
import { Main } from './Main'
import { OpeningTimesModal } from './components/modals/OpeningTimesModal'
import { MessageListModal } from '/components/messages/MessageListModal'
import { modalStore } from './model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/App')

@observer
export class App extends PureComponent {
    render = () => {
        return (
            <MainApp>
                <OpeningTimesModal
                    isVisible={modalStore.showOpeningTimesModal}
                    onClosedProp={modalStore.closeOpeningTimesModal}
                    />
                <MessageListModal
                    visible={modalStore.showMessageListModal}
                    onClose={modalStore.closeMessagListModal}
                    />
            </MainApp>
        )
    }
}

@observer
class MainApp extends PureComponent {

    componentDidMount = () => {
        FCM.requestPermissions() // for iOS
        FCM.getFCMToken().then(token => {
            log("GOT FCM TOKEN", token)
            // store fcm token in your server
        })
        this.notificationUnsubscribe = FCM.on('notification', (notification) => {
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            log("GOT A NOTIFICATION!")
            log(notification)
            if (notification.local_notification) {
                //this is a local notification
                log("LOCAL NOTIFICATION")
            }
            if (notification.opened_from_tray) {
                //app is open/resumed because user clicked banner
                log("OPENED FROM TRAY")
            }
        })
        this.refreshUnsubscribe = FCM.on('refreshToken', (token) => {
            console.log(token)
            // fcm token may not be available on first load, catch it here
        })

        // Test local push notification
        FCM.presentLocalNotification({
            id: "UNIQ_ID_STRING",                               // (optional for instant notification)
            title: "My Notification Title",                     // as FCM payload
            body: "My Notification Message",                    // as FCM payload (required)
            sound: "default",                                   // as FCM payload
            priority: "high",                                   // as FCM payload
            click_action: "ACTION",                             // as FCM payload
            badge: 10,                                          // as FCM payload IOS only, set 0 to clear badges
            number: 10,                                         // Android only
            ticker: "My Notification Ticker",                   // Android only
            auto_cancel: true,                                  // Android only (default true)
            large_icon: "ic_launcher",                           // Android only
            icon: "ic_notification",                            // as FCM payload
            big_text: "Show when notification is expanded",     // Android only
            sub_text: "This is a subText",                      // Android only
            color: "red",                                       // Android only
            vibrate: 300,                                       // Android only default: 300, no vibration if you pass null
            tag: 'some_tag',                                    // Android only
            group: "group",                                     // Android only
            my_custom_data:'my_custom_field_value',             // extra data you want to throw
            lights: true,                                       // Android only, LED blinking (default false)
            show_in_foreground                                  // notification when app is in foreground (local & remote)
        })
    }

    closeOpeningTimesModal = () => {
        modalStore.closeModal()
    }

    render = () => {
        if (Platform.OS === 'android') {
            return (
                <View style={{flex: 1}}>
                    <Main />
                    {this.props.children}
                </View>
            )
        } else {
            return (
                <NavigationProvider router={Router}>
                    <StackNavigation initialRoute={Router.getRoute('main')} />
                    {this.props.children}
                </NavigationProvider>
            )
        }
    }
}
