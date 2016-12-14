import { observable, computed, transaction, autorun, action } from 'mobx'
import { loginStore } from '/model/loginstore'
import { orderStore, normalizeOrderList } from '/model/orders/orderstore'
import { downloadManager } from '/network/http'
import { RefundOrderDownload } from '/network/api/admin/refund'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/admin/refundstore')

/*********************************************************************/
/* Store                                                             */
/*********************************************************************/

export class RefundStore {
    @observable refundAmounts = {}

    @observable additionalRefundAmount = 0.0

    @observable refundOrderID = null
    @observable refundReason = "Not available, sorry."
    @observable orderList = null

    initialize = () => {
        downloadManager.declareDownload(new RefundOrderDownload(
            () => {
                return {
                    authToken: loginStore.getAuthToken(),
                    orderID: this.refundOrderID,
                    refundItems: this.refundItems,
                    reason: this.refundReason,
                }
            }
        ))
    }

    /*********************************************************************/
    /* Order Refunds                                                     */
    /*********************************************************************/

    @action refundNow = () => {
        downloadManager.forceRefresh('refund order')
    }

    getRefundOrderDownload = () => downloadManager.getDownload('refund order')

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    @action showModal = (orderResult) => {
        this.orderList = normalizeOrderList(orderResult)
        this.refundOrderID = orderResult.orderID
        this.selectAll()
    }

    @action closeModal = () => {
        this.orderList = []
        this.refundOrderID = null
    }

    /* Add an order item to the refund list */
    @action increaseRefundAmount = (orderItemID : String) => {
        this.refundAmounts[orderItemID] = _.min(
            this.maximumRefunds[orderItemID],
            this.refundAmounts[orderItemID] + 1
        )
    }

    @action decreaseRefundAmount = (orderItemID : String) => {
        this.refundAmounts[orderItemID] = _.max(
            0,
            this.refundAmounts[orderItemID] - 1
        )
    }

    @action selectAll = () => {
        this.refundAmounts = this.maximumRefunds
    }

    @action deselectAll = () => {
        this.refundAmounts = this.minimumRefunds
    }

    @action setRefundReason = (reason : String) => {
        this.refundReason = reason
    }

    /*********************************************************************/
    /* Compute                                                           */
    /*********************************************************************/

    getOrderList = () => this.orderList

    @computed get orderID2OrderItem() : {OrderItemID: OrderItem} {
        const orderItems = {}
        this.orderList.forEach(orderItem => {
            orderItems[orderItem.id] = orderItem
        })
        return orderItems
    }

    @computed get minimumRefunds() : {OrderItemID: Int} {
        const refundAmounts = {}
        this.orderList.forEach(orderItem => {
            refundAmounts[orderItem.id] = 0
        })
        return refundAmounts
    }

    @computed get maximumRefunds() : {OrderItemID: Int} {
        const refundAmounts = {}
        this.orderList.forEach(orderItem => {
            refundAmounts[orderItem.id] = orderItem.amount
        })
        return refundAmounts
    }

    @computed get refundOrderItems() : Array<OrderItem> {
        return this.orderList
            .filter(this.refunded)
            .map(orderItem => {
                return {
                    id: orderItem.id,
                    menuItemID: orderItem.menuItemID,
                    selectedOptions: orderItem.selectedOptions,
                    amount: this.refundAmounts[orderItem.id],
                }
            })
    }

    @computed get refundItems() : Array<RefundItem> {
        return this.refundOrderItems.map(orderItem => {
            return {
                id: orderItem.id,
                amount: orderItem.amount,
            }
        })
    }

    @computed get orderListTotal() : Int {
        return orderStore.orderListTotal(this.orderList)
    }

    @computed get refundItemTotal() : Int {
        return orderStore.orderListTotal(this.refundOrderItems)
    }

    @computed get refundTotal() : Int {
        return this.refundItemTotal + this.additionalRefundAmount
    }

    @computed get allItemsRefunded() : Bool {
        return this.refundItemTotal === this.orderListTotal
    }

    @computed get refundAmountValid() : Bool {
        return this.refundTotal <= this.orderListTotal
    }

    refundAmount = (orderItem : OrderItem) : Int => {
        return this.refundAmounts[orderItem.id]
    }

    refunded = (orderItem : OrderItem) : Bool => {
        return this.refundAmount(orderItem) > 0
    }
}

export const refundStore = new RefundStore()
