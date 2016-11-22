import { computed } from 'mobx'
import { FeedDownload } from '/network/http'
import { OrderResultQuery } from './order'
import { config } from '/utils/config'

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
