import { computed } from 'mobx'
import { QueryDownload } from '~/src/network/http'
import { OrderResultQuery } from './order'
import { config } from '~/src/utils/config'

export class OrderStatusDownload extends QueryDownload {
    /* properties:
        authToken:      String
        userID:         String
        orderID:        String
        orderCompleted: String
    */
    name = 'order status'

    /* Refresh every 10s */
    cacheInfo = config.defaultRefreshCacheInfo
    periodicRefresh = 10

    @computed get cacheKey() {
        return `qd:orderstatus:userID=${this.props.userID}`
    }

    @computed get active() {
        return this.props.orderID != null && !this.props.orderCompleted && this.props.authToken
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
                }
            }
        }
    }

    @computed get orderResult() {
        return this.lastValue && this.lastValue.orderResult
    }
}
