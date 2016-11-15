import {
    React,
    Component,
    View,
    Image,
    PureComponent,
    StyleSheet,
    T,
} from '/components/Component'
import { observable, action, computed, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { downloadManager } from '/network/http'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/notification/ConnectionBar')

export const connectionBarHeight = 30

export const getConnectionBarHeight = () => {
    if (downloadManager.connected)
        return 0
    return connectionBarHeight
}

const styles = StyleSheet.create({
    view: {
        flex: 0,
        height: connectionBarHeight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: config.theme.primary.medium,
    },
    text: {
        fontSize: 16,
        color: '#fff',
    },
})

@observer
export class ConnectionBar extends PureComponent {
    /* properties:
        style: style obj
    */
    render = () => {
        if (downloadManager.connected)
            return null

        return (
            <View style={[styles.view, this.props.style]}>
                <T style={styles.text}>
                    Connecting...
                </T>
            </View>
        )
    }
}
