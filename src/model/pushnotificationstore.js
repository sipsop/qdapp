// import PushNotification from 'react-native-push-notification'
import FCM from 'react-native-fcm'

import { messageStore, makeMessage } from './messagestore'
import { getTime } from '/utils/time'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/pushnotificationstore')

const convertToBool = (value : ?String) => {
    if (value == null)
        return false
    return value === 'true'
}

class PushNotificationStore {

    @observable fcmToken = null

    getFirebaseToken = () => this.fcmToken

    initialize = () => {
        FCM.requestPermissions() // for iOS
        FCM.getFCMToken().then(fcmToken => {
            this.fcmToken = fcmToken
        })

        this.notificationUnsubscribe = FCM.on('notification', (notification) => {
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
            log("GOT A NOTIFICATION!", notification)
            if (notification.local_notification) {
                //this is a local notification
                log("LOCAL NOTIFICATION")
            } else if (!notification.opened_from_tray) {
                /* Remote notification while running in foreground.
                This means no notification has been shown, so show one now.
                */
                localPushNotification(notification)
                messageStore.showMessage(
                    makeMessage({
                        timestamp: getTime(),
                        messageID: notification.id,
                        ...notification,
                        /* NOTE: Booleans are somehow converted into strings... */
                        flash:   convertToBool(notification.flash),
                        vibrate: convertToBool(notification.vibrate),
                        sound:   convertToBool(notification.sound),
                        popup:   convertToBool(notification.popup),
                    })
                )
            }

            if (notification.opened_from_tray) {
                /* Notification opened from tray, open deep link */
                log("NOTICATION OPENED FROM TRAY")
                // openDeepLink(notification.deepLink)
                // acknowledgeMessage(notification.messageID)
            }
        })
        this.refreshUnsubscribe = FCM.on('refreshToken', (fcmToken) => {
            this.fcmToken = fcmToken
        })
    }

    initialize2 = () => {
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log( 'TOKEN:', token )
            },

            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification )
            },

            // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
            // senderID: "YOUR GCM SENDER ID",
            senderID: "107476294921",

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: false,

            /**
              * (optional) default: true
              * - Specified if permissions (ios) and token (android and ios) will requested or not,
              * - if not, you must call PushNotificationsHandler.requestPermissions() later
              */
            requestPermissions: false,
        })
    }
}

export const localPushNotification = (message : Message) => {
    FCM.presentLocalNotification({
            // (optional for instant notification)
            id: message.messageID,
            // as FCM payload
            title: message.title,
            // as FCM payload (required)
            body:  message.content,
           // as FCM payload
            sound: message.sound ? "default" : undefined,
            priority: "high",                                   // as FCM payload
            click_action: "ACTION",                             // as FCM payload

            /* iOS only */
            // as FCM payload IOS only, set 0 to clear badges
            badge: 10,

            // icon: "ic_notification",
            // my_custom_data: 'my_custom_field_value',
            // notification when app is in foreground (local & remote)
            show_in_foreground: true,

            /* Android Only */
            // large_icon: "ic_launcher",
            // number: 10,
            // ticker: "My Notification Ticker",
            auto_cancel: true,
            // big_text: "Show when notification is expanded",
            // sub_text: "This is a subText",
            // color: "red",
            // Android only default: 300, no vibration if you pass null
            vibrate: message.vibrate ? 300 : undefined,
            tag: message.topic,
            // group: "group",
            // LED blinking (default false)
            lights: message.popup,
        });
}

export const localPushNotification2 = (message : Message) => {
    PushNotification.localNotification({
        /* iOS and Android properties */
        title: message.title, // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
        message: message.content, // (required)
        playSound: message.sound, // (optional) default: true
        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        // number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
        // repeatType: 'minute', // (Android only) Repeating interval. Could be one of `week`, `day`, `hour`, `minute, `time`. If specified as time, it should be accompanied by one more parameter 'repeatTime` which should the number of milliseconds between each interval

        /* Android Only Properties */
        // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        id: message.messageID || undefined,
        // ticker: "My Notification Ticker", // (optional)
        // (optional) default: true
        autoCancel: true,
        // (optional) default: "ic_launcher"
        // largeIcon: "ic_launcher",
        // (optional) default: "ic_notification" with fallback for "ic_launcher"
        smallIcon: "ic_notification",
         // (optional) default: "message" prop
        // bigText: message.content,
        // (optional) default: none
        // subText: message.title,
        // (optional) default: system default
        // color: "red",
        // (optional) default: true
        vibrate: message.vibrate || false,
        // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        vibration: message.vibrationLength || 300,
        // (optional) add tag to message
        tag: message.topic,
        // (optional) add group to message
        // group: "g        /* iOS only properties */
        // alertAction: // (optional) default: view
        // category: // (optional) default: null
        // userInfo: // (optional) default: null (object containing additional notification data)
    })
}

// localPushNotification({
//     title: "Message Title",
//     content: "Message Body Here",
//     messageID: "29292923",
// })

export const pushNotificationStore = new PushNotificationStore()
