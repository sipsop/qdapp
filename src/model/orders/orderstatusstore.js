import { observable, computed, action, asMap } from 'mobx'
import shortid from 'shortid'

import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { downloadManager } from '/network/http'
import { loginStore } from '../loginstore'
import * as _ from '/utils/curry'

const { log, assert } = _.utils(__filename)

class OrderStatusStore {
    @observable orderID = null
    @observable _initialized = false

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    getState = () => {
        return {
            orderID: this.haveUncompletedOrder ? this.orderID : null,
        }
    }

    emptyState = () => {
        return {
            orderID: null,
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

    initialized = () => {
        this._initialized = true
    }

    getOrderStatusDownload = () => downloadManager.getDownload('order status')

    @computed get orderResult() {
        if (this._initialized)
            return this.getOrderStatusDownload().orderResult
        return null
    }

    @computed get orderCompleted() {
        if (!this.orderResult)
            return false
        return !!this.orderResult.completed
    }

    @computed get haveUncompletedOrder() {
        return !!(
            loginStore.isLoggedIn &&
            this.orderID &&
            this.orderResult &&
            !this.orderCompleted
        )
    }
}

export const orderStatusStore = new OrderStatusStore()
