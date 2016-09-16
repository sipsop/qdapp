import { React, Component, View, TouchableOpacity, PureComponent, T } from '../Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Icon from 'react-native-vector-icons/FontAwesome'
// import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { TextHeader } from '../Header.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { DownloadResult, DownloadResultView, emptyResult, downloadManager } from '../HTTP.js'
import { orderStore } from './OrderStore.js'
import * as _ from '../Curry.js'

/***************************************************************************/

import type { CacheInfo } from '../Cache.js'

/***************************************************************************/

const { log, assert } = _.utils('./Orders/History.js')

const historyQuery = `
    query history {
        recentOrders(n: 100) {
            orderHistory {
                barID
                date
                time
                userName
                queueSize
                estimatedTime
                receipt
                orderList
            }
        }
    }
`

const cacheInfo : CacheInfo = {refreshAfter: 0}

@observer
export class OrderHistoryModal extends PureComponent {
    /* properties:
        onClose: () => void
    */
    modal = null

    show = () => this.modal.show()

    render = () => {
        return <SimpleModal
                    ref={ref => this.modal =ref}
                    onClose={this.props.onClose}
                    >
            <OrderHistory />
        </SimpleModal>
    }
}

@observer
export class OrderHistory extends DownloadResultView {
    errorMessage = "Error downloading order history..."
    getDownloadResult = () => orderHistoryStore.getOrderHistoryDownload()
    refreshPage = () => orderHistoryStore.fetchOrderHistory()
    renderNotStarted = () => <View />

    @computed get nItems() {
        return orderHistoryStore.orderHistory.length
    }

    renderFinished = (_) => {
        return <SimpleListView
                    N={this.nItems}
                    initialListSize={4}
                    renderRow={this.renderRow}
                    renderHeader={this.renderHeader}
                    enableEmptySections={true} />
    }

    renderHeader = () => {
        return <TextHeader
                    label="Order History"
                    rowHeight={55} />
    }

    renderRow = (i) => {
        const orderHistory = orderHistoryStore.orderHistory
        const orderResult = orderHistory[i]
        return <T>{orderResult.barID} {orderResult.date}</T>
    }
}

class OrderHistoryStore {
    @observable orderHistoryDownload = emptyResult()

    getOrderHistoryDownload = () => this.orderHistoryDownload

    fetchOrderHistory = _.logErrors(async () => {
        await this._fetchOrderHistory()
    })

    _fetchOrderHistory = async () => {
        this.orderHistoryDownload.downloadStarted()
        const download = await downloadManager.graphQL(
            'qd:order:history', historyQuery, cacheInfo)
        _.runAndLogErrors(() => {
            this.orderHistoryDownload = download.update(data => data.recentOrders)
        })
    }

    @computed get orderHistory() : Array<OrderResult> {
        if (!this.orderHistoryDownload.value)
            return []
        const orderHistory = this.orderHistoryDownload.value.orderHistory
        return orderHistory.map(orderResult => {
            /* orderResult has String options, convert them to Int options */
            // TODO: REMOVE
            orderResult.orderList = orderStore.orderList
            return orderResult
        })
    }
}

export const orderHistoryStore = new OrderHistoryStore()
