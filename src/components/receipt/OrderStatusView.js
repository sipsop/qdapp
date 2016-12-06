import { React, Component, View, T, PureComponent } from '/components/Component'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadComponent } from '../download/DownloadComponent'
import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { loginStore } from '/model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/receipt/OrderStatusView.js')

@observer
export class OrderStatusView extends DownloadComponent {
    /* properties:
        orderID: OrderID
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
        throw new Error("Not implemented")
    }
}
