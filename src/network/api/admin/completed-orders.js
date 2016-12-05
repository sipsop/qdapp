import { computed, transaction, action, autorun } from 'mobx'
import { QueryDownload } from '/network/http'
import { OrderResultQuery } from '../orders/order'
import { getClearingProps } from '../user/userquery'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/admin/completed-orders.js')

export class CompletedOrdersDownload extends QueryDownload {
    /* properties:
        authToken: String
        barID: String
        completedBefore: ?TimeStamp
            get order history before the given timestamp
    */

    name = 'completed orders'
    autoDownload = false
    cacheInfo = config.defaultRefreshCacheInfo

    @computed get cacheKey() {
        return `qd:barID=${this.props.barID}:before=${this.props.before}`
    }

    getClearingProps = getClearingProps

    @computed get query() {
        return {
            CompletedOrders: {
                args: {
                    authToken: this.props.authToken,
                    barID: this.props.barID,
                    before: {
                       completedTimestamp: this.props.completedBefore,
                    },
                },
                result: {
                    completedOrders: [OrderResultQuery],
                },
            }
        }
    }

    @computed get completedOrders() {
        return this.value && this.value.completedOrders
    }
}
