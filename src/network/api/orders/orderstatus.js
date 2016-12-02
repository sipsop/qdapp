import { computed } from 'mobx'
import { FeedDownload } from '/network/http'
import { OrderResultQuery } from './order'
import * as _ from '/utils/curry'
import { getClearingProps } from '../user/userquery'
import { config } from '/utils/config'

const { assert, log } = _.utils('/network/api/order/orderstatus.js')

export class OrderStatusDownload extends FeedDownload {
    /* properties:
        authToken:      String
        userID:         String
        orderID:        String
    */
    name = 'order status'

    /* Refresh every 10s */
    // cacheInfo = config.defaultRefreshCacheInfo
    // periodicRefresh = 15

    @computed get active() {
        return this.props.orderID != null && this.props.authToken
    }

    @computed get cacheKey() {
        return `qd:orderstatus:userID=${this.props.userID}:orderID=${this.props.orderID}`
    }

    getClearingProps = getClearingProps

    @computed get query() {
        return {
            OrderStatus: {
                args: {
                    authToken: this.props.authToken,
                    orderID:   this.props.orderID,
                },
                result: {
                    orderResult: OrderResultQuery,
                },
            }
        }
    }

    @computed get orderResult() {
        return this.lastValue && this.lastValue.orderResult
    }
}
