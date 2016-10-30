import { observable, computed, transaction, action, autorun } from 'mobx'
import { QueryMutation } from '~/src/network/http'
import { MenuItemQuery } from '../bar/menu'

export const OrderItemQuery = {
    id:                 'String',
    menuItemID:         'String',
    selectedOptions:    [['String']],
    amount:             'Int',
}

export const OrderResultQuery = {
    errorMessage: 'String',
    barID:        'String',
    timestamp:    'Float',
    userName:     'String',

    queueSize:     'Int',
    estimatedTime: 'Int',
    receipt:       'String',

    menuItems:      [MenuItemQuery],
    orderList:      [OrderItemQuery],
    totalAmount:    'Int',
    totalPrice:     'Int',
    tip:            'Int',
    currency:       'String',

    delivery:       'String',
    tableNumber:    'String',
    pickupLocation: 'String',
}

export class PlaceOrderDownload extends QueryMutation {
    /* properties:
        orderID:                String
        barID:                  String
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
                    orderID:        this.props.orderID,
                    barID:          this.props.barID,
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
        return this.value && this.value.orderResult
    }
}
