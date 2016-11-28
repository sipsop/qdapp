import { computed, transaction, action, autorun } from 'mobx'
// import { BarQueryDownload } from './barquery.js'
import { FeedDownload } from '/network/http'
import { config } from '/utils/config'

import { OrderResultQuery } from '../orders/order'

export class ActiveOrderDownload extends FeedDownload {
    /* properties:
        barID: String
        authToken: String
        userIsBarOwner: Bool
    */

    name = 'active orders'

    @computed get active() {
        return this.props.userIsBarOwner
    }

    @computed get cacheKey() {
        return `qd:activeOrders:barID=${this.props.barID}`
    }

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
        return this.lastValue && this.lastValue.orderID
    }

    @computed get orderDeleted() {
        return this.lastValue && this.lastValue.orderDeleted
    }

    @computed get orderResult() {
        return this.lastValue && this.lastValue.orderResult
    }
}
