import { observable, computed, transaction, action, autorun } from 'mobx'
import { QueryMutation } from './HTTP.js'
import { OrderResultQuery } from './Orders/OrderQuery.js'

export class PlaceOrderDownload extends QueryMutation {
    /* properties:
        barID:                  String
        shouldPlaceOrderNow:    Bool
        stripeToken:            String
        authToken:              String
        userName:               String
        price:                  Int
        tipAmount:              Int
        currency:               Currency
        orderList:              [OrderItem]
        delivery:               'Table' | 'Pickup'
        tableNumber:            String
        pickupLocation:         [String]
    */
    name = 'placeOrder'

    /* Start this download only after the 'stripe' download has finished */
    depends = ['stripe']

    @computed get active() {
        return this.props.shouldPlaceOrderNow
    }

    @computed get query() {
        const orderList = this.props.orderList.map(orderItem => {
            return {
                id:                     orderItem.id,
                menuItemID:             orderItem.menuItemID,
                selectedOptions:        orderItem.selectedOptions,
                amount:                 orderItem.amount,
            }
        })

        const tableNumber =
            this.props.delivery === 'Table'
                ? this.props.tableNumber
                : ""

        const pickupLocation =
            this.props.delivery === 'Pickup'
                ? this.props.pickupLocation
                : ""

        return {
            PlaceOrder: {
                args: {
                    barID:          barStore.barID,
                    authToken:      this.props.authToken,
                    userName:       this.props.userName,
                    currency:       this.props.currency,
                    price:          this.props.price,
                    tip:            this.props.tipAmount,
                    orderList:      orderList,
                    stripeToken:    this.props.stripeToken,
                    delivery:       this.props.delivery,
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
