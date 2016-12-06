import { observable, computed, transaction, autorun, action } from 'mobx'
import { orderStore } from '/model/orders/orderstore'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/admin/refundstore')

export class RefundStore {
    @observable refundOrderIndices = []
    @observable refundAmount = 0.0
    @observable refundReason = "Not available, sorry."
    @observable refundOrderID = null
    @observable orderList = null

    initialize = () => {

    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    @action showModal = (orderResult) => {
        this.orderList = orderStore.decompressOrderList(orderResult.orderList)
        this.refundOrderID = orderResult.orderID
    }

    @action closeModal = () => {
        this.orderList = []
        this.refundOrderID = null
    }

    /* Add an order item to the refund list */
    @action addRefund = (orderIndex : Int) => {
        this.refundOrderIndices.push(orderIndex)
    }

    @action removeRefund = (orderIndex : Int) => {
        this.refundOrderIndices = this.refundOrderIndices.filter(
            idx => idx !== orderIndex
        )
    }

    @action selectAll = () => {
        this.refundOrderIndices = _.range(this.orderList.length)
    }

    @action deselectAll = () => {
        this.refundOrderIndices = []
    }

    /*********************************************************************/
    /* Compute                                                           */
    /*********************************************************************/

    getOrderList = () => this.orderList

    @computed get refundOrderItems() {
        return this.orderList.filter((orderItem, orderIndex) => {
            // quadratic...
            return this.refunded(orderIndex)
        })
    }

    @computed get allItemsRefunded() {
        return this.refundOrderIndices.length === this.orderList.length
    }

    @computed get orderListTotal() {
        return orderStore.orderListTotal(this.orderList)
    }

    @computed get refundItemTotal() {
        return orderStore.orderListTotal(this.refundOrderItems)
    }

    @computed get refundTotal() {
        return this.refundItemTotal + this.refundAmount
    }

    @computed get refundAmountValid() {
        return this.refundTotal <= this.orderListTotal
    }

    /* Whether `orderItem` has been refunded */
    refunded = (orderIndex) : Bool => {
        return _.includes(this.refundOrderIndices, orderIndex)
    }
}

export const refundStore = new RefundStore()
