import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { Receipt } from './Receipt'
import { DownloadComponent } from '../download/DownloadComponent'
import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { store, tabStore, loginStore, segment } from '/model/store.js'

import { barStore, orderStore } from '/model/store.js'
import { formatDuration } from '/utils/time'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/receipt/ReceiptDownload.js')

assert(Receipt != null, "Receipt is null...")

@observer
export class ReceiptDownload extends DownloadComponent {
    /* properties:
        bar: Bar
        orderID: OrderID
        onClose: () => void
            called when receipt view is closed
    */

    inProgressMessage = "Retrieving order status..."

    getDownload = () => {
        return new OrderStatusDownload(() => {
            return {
                orderID:   this.props.orderID,
                authToken: loginStore.getAuthToken(),
            }
        })
    }

    @computed get orderResult() {
        return this.getDownloadResult().orderResult
    }

    renderFinished = (_) => {
        if (!this.orderResult) {
            /* TODO: Why is orderResult null sometimes? */
            return this.renderInProgress()
        }
        return (
            <Receipt
                bar={this.props.bar}
                orderResult={this.orderResult}
                onClose={this.props.onClose}
                />
        )
    }
}
