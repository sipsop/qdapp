import {
    React,
    Component,
    PureComponent,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    T,
} from './Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from './HTTP.js'
import { Notification as _Notification } from './Notification.js'
import { barStore, barStatusStore } from './Store.js'
import { config } from './Config.js'

export const Notification = _Notification

export class BarStatusNotification extends DownloadResultView {

    errorMessage      = "Error downloading bar status"
    getDownloadResult = () => barStatusStore.barStatusDownload
    refreshPage       = () => barStatusStore.downloadBarStatus()

    renderFinished = () => {
        var message = null
        var closeable = false

        if (!barStatusStore.isQDodgerBar) {
            message = 'No menu available :('
        } else if (!barStatusStore.takingOrders) {
            message = `${barStore.barName} is not currently accepting orders`
        } else if (!barStatusStore.tableService) {
            message = `No table service available, sorry.`
            closeable = true
        }

        if (!message)
            return null

        return <Notification
                    style={{height: 55}}
                    message={message}
                    position="TopCenter"
                    closeable={closeable} />
    }
}
