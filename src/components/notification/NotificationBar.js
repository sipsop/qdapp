import {
    React,
    Component,
    PureComponent,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    T,
} from '/components/Component.js'
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { MessageView } from '../messages/MessageView'
import { store, messageStore } from '/model/store'
import * as _ from '/utils/curry'

const { assert, log } = _.utils(__filename)

const styles = StyleSheet.create({
    notification: {
        margin: 0,
        borderRadius: 0,
        height: 55,
        justifyContent: 'center',
    },
})

@observer
export class NotificationBar extends PureComponent {
    render = () => {
        if (!messageStore.message)
            return null
        return (
            <MessageView
                style={styles.notification}
                message={messageStore.message}
                numberOfLines={2}
                />
        )
    }
}
