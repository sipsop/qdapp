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

import { DownloadResultView, DownloadResult, emptyResult } from '~/network/http'
import { Notification as _Notification } from './Notification.js'
import { barStore, barStatusStore, tagStore } from '~/model/store.js'
import * as _ from '~/utils/curry.js'
import { config } from '~/utils/config.js'

export const Notification = _Notification

const { assert, log } = _.utils('./Notifications.js')

@observer
export class BarStatusNotification extends DownloadResultView {
    /* properties:
        absolutePosition: Bool
    */

    static defaultProps = {
        absolutePosition: true,
    }

    errorMessage      = "Error downloading bar status"
    getDownloadResult = () => barStatusStore.barStatusDownload
    refreshPage       = () => barStatusStore.downloadBarStatus()

    @observable lastState = null

    @computed get visible() {
        return this.getDownloadResult().state != this.lastState
    }

    close = () => {
        this.lastState = this.getDownloadResult().state
    }

    renderFinished = () => {
        let message = null
        let closeable = false

        if (!barStatusStore.isQDodgerBar) {
            message = 'No menu available :('
        } else if (!barStatusStore.takingOrders) {
            message = `Sorry, the bar is not currently accepting orders`
            closeable = true
        } else if (!barStatusStore.tableService) {
            message = `No table service available, sorry.`
            closeable = true
        }

        if (!message)
            return null

        return <Notification
                    style={{minHeight: 55}}
                    message={message}
                    position="TopCenter"
                    closeable={closeable}
                    onPress={this.close}
                    visible={this.visible}
                    absolutePosition={this.props.absolutePosition} />
    }
}

export type Message = ?{
    message: String,
    closeable: ?Bool,
    dismissLabel: ?String,
}

// let barInfoDownloadResult = emptyResult()
//
// autorun(() => {
//     barInfoDownloadResult = DownloadResult.combine([
//         barStore.barDownloadResult,
//         barStore.menuDownloadResult,
//         tagStore.tagDownloadResult,
//         barStatusStore.barStatusDownload,
//     ])
// })

@observer
export class BarInfoNotification extends DownloadResultView {
    @computed get barInfoDownloadResult() {
        return DownloadResult.combine([
            barStore.barDownloadResult,
            barStore.menuDownloadResult,
            tagStore.tagDownloadResult,
            barStatusStore.barStatusDownload,
        ])
    }
    getDownloadResult = () => this.barInfoDownloadResult
    renderFinished = () => null
}

@observer
export class NotificationBar extends DownloadResultView {
    /* properties:
        downloadResult: DownloadResult
        additionalNotifications: () => ?Message
    */

    styles = {
        notification: {
            height: 55,
            flexWrap: 'wrap',
            borderRadius: 0,
            margin: 0
        },
    }

    getDownloadResult = () => this.props.downloadResult
    refreshPage = () => this.props.downloadResult.refresh()

    renderInProgress = () => null
    renderError = (message) => {
        const errorMessage = this.formatErrorMessage(message)
        return <Notification
                    style={this.styles.notification}
                    message={errorMessage}
                    absolutePosition={false}
                    dismissLabel={dismissLabel}
                    dismissDirection='row'
                    numberOfLines={2}
                    textSize="small"
                    onPress={this.props.downloadResult.refreshPage} />
    }

    renderFinished = () => {
        if (!this.props.additionalNotifications)
            return null
        const message : Message = this.props.additionalNotifications()
        if (!message)
            return null
        return <Notification
                    style={this.styles.notification}
                    message={message.message}
                    absolutePosition={false}
                    dismissLabel={message.dismissLabel}
                    dismissDirection='row'
                    numberOfLines={2}
                    textSize="small"
                    closeable={message.closeable} />
    }
}
