import { React, Component, View, TouchableOpacity, PureComponent, T } from '../Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Icon from 'react-native-vector-icons/FontAwesome'
// import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { DownloadResult, DownloadResultView, emptyResult, downloadManager } from '../HTTP.js'
import * as _ from '../Curry.js'

/***************************************************************************/

import type { CacheInfo } from '../Cache.js'

/***************************************************************************/

const { log, assert } = _.utils('./Orders/History.js')

const historyQuery = `
    query history {
        recentOrders(n: 100) {
            orderHistory {
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
            <SimpleListView />
        </SimpleModal>
    }
}


class OrderHistoryStore {
    @observable orderHistoryDownload = emptyResult()

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
        return this.orderHistoryDownload.value.orderHistory
    }
}

export const orderHistoryStore = new OrderHistoryStore()
