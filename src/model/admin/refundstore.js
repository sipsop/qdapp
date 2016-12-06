import { observable, computed, transaction, autorun, action } from 'mobx'
import { orderStore } from '/model/orders/orderstore'
import * as _ from '/utils/curry'

export class RefundStore {
    @observable refundOrderItems = []
    @observable refundAmount = 0.0
    orderList = null

    constructor(orderList) {
        this.orderList = orderList
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    /* Add an order item to the refund list */
    @action addRefundOrderItem = (orderItem) => {
        this.refundOrderItems.push(orderItem)
    }

    @action removeRefundOrderItem = (orderItem) => {
        this.refundOrderItems = this.refundOrderItems.filter(
            o => o.id !== orderItem.id
        )
    }

    @action selectAll = () => {
        this.refundOrderItems = this.orderList.slice()
    }

    @action deselectAll = () => {
        this.refundOrderItems = []
    }

    /*********************************************************************/
    /* Compute                                                           */
    /*********************************************************************/

    @computed get allItemsRefunded() {
        return this.refundOrderItems.length === this.orderList.length
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
    refunded = (orderItem) : Bool => {
        return _.includes(
            this.refundOrderItems,
            orderItem,
            (o1, o2) => o1.id === o2.id,
        )
    }
}
