import { observable, transaction, computed, action, autorun } from 'mobx'
import { barStore } from '../barstore'
import { loginStore } from '../loginstore'
import { downloadManager } from '/network/http'
import { ActiveOrderDownload } from '/network/api/admin/active-orders'
import { CompleteOrderDownload } from '/network/api/admin/complete-order'
import { RefundOrderDownload } from '/network/api/admin/refund'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/activeorderstore.js')

class ActiveOrderStore {
    @observable activeOrderList : Array<OrderResult> = []
    @observable barID = null

    /* order completion download params */
    @observable completedOrderID = null

    /* refund download params */
    @observable refundOrderID  = null
    @observable refundItems    = null
    @observable refundReason     = null

    /*********************************************************************/
    /* Downloads                                                         */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new ActiveOrderDownload(
            () => {
                return {
                    barID: barStore.barID,
                    authToken: loginStore.getAuthToken(),
                    userIsBarOwner: loginStore.isCurrentBarOwner,
                }
            },
            {
                /* Clear all active orders on feed (re)start */
                onStart: () => this.clearActiveOrders(),
                /* Add any orders as they stream in, and delete completed ones */
                onFinish: () => {
                    const feed = this.getActiveOrderFeed()
                    if (feed.value) {
                        if (feed.orderDeleted) {
                            this.deleteActiveOrderItem(feed.orderID)
                        } else {
                            this.addActiveOrderItem(feed.orderResult)
                        }
                    }
                }
            }
        ))
        downloadManager.declareDownload(new CompleteOrderDownload(
            () => {
                return {
                    authToken: loginStore.getAuthToken(),
                    orderID: this.completedOrderID,
                }
            }
        ))
        downloadManager.declareDownload(new RefundOrderDownload(
            () => {
                return {
                    authToken: loginStore.getAuthToken(),
                    orderID: this.refundedOrderID,
                    refundItems: this.refundedItems,
                    reason: this.refundReason,
                }
            }
        ))
    }

    getActiveOrderFeed = () => downloadManager.getDownload('active orders')

    /*********************************************************************/
    /* Active Order List                                                 */
    /*********************************************************************/

    @action addActiveOrderItem = (orderResult : OrderResult) => {
        assert(orderResult != null, "orderResult is null...")
        assert(orderResult.orderID != null, "ordderResult.orderID is null...")
        for (var i = 0; i < this.activeOrderList.length; i++) {
            const orderResult2 = this.activeOrderList[i]
            if (orderResult.orderID === orderResult2.orderID) {
                this.activeOrderList[i] = orderResult
                return
            }
        }

        /* No existing order with orderResult.orderID, add new */
        this.activeOrderList.push(orderResult)
    }

    @action deleteActiveOrderItem = (orderID : String) => {
        this.activeOrderList = this.activeOrderList.filter(
            orderResult => orderResult.orderID !== orderID
        )
    }

    @action clearActiveOrders = () => {
        this.activeOrderList = []
    }

    /*********************************************************************/
    /* Order Completion and Order Refunds                                */
    /*********************************************************************/

    @action completeOrder = (orderID) => {
        this.completedOrderID = orderID
        downloadManager.forceRefresh('complete order')
    }

    @action refundOrder = (orderID, refundItems : Array<RefundOrderItem>, refundReason : ?String) => {
        this.refundOrderID = orderID
        this.refundItems = refundItems
        this.refundReason = refundReason
        downloadManager.forceRefresh('refund order')
    }

    /*********************************************************************/
    /* Bar Changes                                                       */
    /*********************************************************************/

    @computed get barIDHasChanged() {
        return this.barID !== barStore.barID
    }
}

export const activeOrderStore = new ActiveOrderStore()

autorun(() => {
    if (activeOrderStore.barIDHasChanged) {
        activeOrderStore.clearActiveOrders()
        activeOrderStore.barID = barStore.barID
    }
})
