import { observable, computed, transaction, action, autorun } from 'mobx'
import { QueryMutation } from './HTTP.js'
import { OrderResultQuery } from './Orders/OrderQuery.js'

export class PlaceOrderDownload extends QueryMutation {
    name = 'placeOrder'

    /* Start this download only after the 'stripe' download has finished */
    depends = ['stripe']

    // @computed get active() {
    //     return stores.orderStore.shouldPlaceOrderNow()
    // }

    @computed get query() {
        const orderStore = stores.orderStore
        const total     = orderStore.orderListTotal(orderStore.orderList)
        const orderList = orderStore.orderList.map(orderItem => {
            return {
                id:                     orderItem.id,
                menuItemID:             orderItem.menuItemID,
                selectedOptions:        orderItem.selectedOptions,
                amount:                 orderItem.amount,
            }
        })

        const tableNumber =
            orderStore.delivery === 'Table'
                ? orderStore.tableNumber
                : ""

        const pickupLocation =
            orderStore.delivery === 'Pickup'
                ? orderStore.pickupLocation
                : ""

        const stripeToken = downloadManager.getDownload('stripe').stripeToken

        return {
            PlaceOrder: {
                args: {
                    barID:          barStore.barID,
                    authToken:      loginStore.getAuthToken(),
                    userName:       userName,
                    currency:       currency,
                    price:          total,
                    tip:            orderStore.tipAmount,
                    orderList:      orderList,
                    stripeToken:    stripeToken,
                    delivery:       orderStore.delivery,
                    tableNumber:    tableNumber,
                    pickupLocation: pickupLocation,
                },
                result: {
                    orderResult: OrderResultQuery,
                }
            }
        }
    }

    @computed get orderResult() {
        return this.lastValue && this.lastValue.orderResult
    }
}
