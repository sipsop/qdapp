import { computed, transaction, action, autorun } from 'mobx'
import { FeedStreamDownload } from '/network/http'
import { OrderResultQuery } from '../orders/order'
import { getClearingProps } from '../user/userquery'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/admin/active-orders.js')

export class ActiveOrderDownload extends FeedStreamDownload {
    /* properties:
        barID: String
        authToken: String
        userIsBarOwner: Bool
    */

    name = 'active orders'

    @computed get active() {
        return this.props.userIsBarOwner
    }

    getClearingProps = getClearingProps

    @computed get query() {
        return {
            ActiveOrders: {
                args: {
                    barID: this.props.barID,
                    authToken: this.props.authToken,
                },
                result: {
                    orderID:      'String',
                    orderDeleted: 'Bool',
                    orderResult:  OrderResultQuery,
                },
            }
        }
    }

    @computed get orderID() {
        return this.value && this.value.orderID
    }

    @computed get orderDeleted() {
        return this.value && this.value.orderDeleted
    }

    @computed get orderResult() {
        return this.value && this.value.orderResult
    }
}
