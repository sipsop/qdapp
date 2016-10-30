import { observable, computed, action, asMap } from 'mobx'
import shortid from 'shortid'

import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { downloadManager } from '/network/http'
import { loginStore } from '../loginstore'
import * as _ from '/utils/curry'

const { log, assert } = _.utils(__filename)

class OrderStatusStore {
    @observable orderID = null

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    getState = () => {
        return {
            orderID: this.haveUncompletedOrder && this.orderID,
        }
    }

    @action setState = (state) => {
        this.orderID = state.orderID
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    @action setOrderID = (orderID) => {
        this.orderID = orderID
    }

    /*********************************************************************/
    /* Downloads                                                         */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new OrderStatusDownload(() => {
            const props = {
                orderID:        this.orderID,
                authToken:      loginStore.getAuthToken(),
                orderCompleted: this.orderCompleted,
            }
            return props
        }))
    }

    getOrderStatusDownload = () => downloadManager.getDownload('order status')

    @computed get orderResult() {
        return this.getOrderStatusDownload().orderResult
    }

    @computed get orderCompleted() {
        if (!this.orderResult)
            return false
        return !!this.orderResult.completed
    }

    @computed get haveUncompletedOrder() {
        return loginStore.isLoggedIn &&
               this.orderID != null &&
               !this.orderCompleted
    }

    @computed get orderStatusMessage() {
        const d = this.getOrderStatusDownload()
        if (this.orderResult != null) {
            if (this.orderResult.errorMessage)
                return this.orderResult.errorMessage
            return `Order ${this.orderResult.receipt} will be ready in approx. ${this.orderResult.estimatedTime}`
        } else if (d.lastMessage) {
            return d.lastMessage
        } else {
            return 'Getting your order status...'
        }
    }
}

export const orderStatusStore = new OrderStatusStore()
