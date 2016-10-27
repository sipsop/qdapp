import {
    React,
    Component,
    PureComponent,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    T,
} from '~/components/Component.js'
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from '../download/DownloadResultView'
import { Notification } from './Notification'
import { notificationStore } from '~/model/notificationstore'
import * as _ from '~/utils/curry'
import { config } from '~/utils/config'

const { assert, log } = _.utils(__filename)

const styles = StyleSheet.create({
    notification: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        height: 55,
        margin: 5,
        padding: 5,
        borderRadius: 10,
    },
    notificationText: {
        color: '#fff',
        fontSize: 15,
        margin: 5,
    },
    verticalBar: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        height: 35,
        width: 1,
        margin: 5,
    },
    dismissButton: {
        flexWrap: 'wrap',
        padding: 5,
    },
    dismissText: {
        fontSize: 17,
        color: config.theme.primary.medium,
    },
})

@observer
export class NotificationBar extends PureComponent {
    /* properties:
        flashPeriod: Int
            number of seconds to flash notifications that have a lower priority
            that the current notification
    */

    render = () => {
        const message = notificationStore.currentNotification
        if (!message)
            return null

        const dismiss = message.onDismiss || (() => notificationStore.dismiss(message.id))

        return (
            <View style={styles.notification}>
                <View style={{flex: 1}}>
                    <T style={styles.notificationText} numberOfLines={2}>
                        {message.message}
                    </T>
                </View>
                <View style={styles.verticalBar} />
                { message.closeable &&
                    <TouchableOpacity onPress={dismiss}>
                        <View style={styles.dismissButton}>
                            <T style={styles.dismissText}>
                                {message.buttonLabel || 'DISMISS'}
                            </T>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}

// notificationStore.notify({
//     id: 'hello',
//     message: 'Hello World! here is a  lot of text lbha fdjkfk;ajfi fehia;efh iaew feihao;e fi;oej fi;ae hfeahf e;of e ;eafh;fhei;a fh;eawhfea8;hfeaw;',
// })
