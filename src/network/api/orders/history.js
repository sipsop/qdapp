import { computed, transaction, action, autorun } from 'mobx'
import { QueryDownload } from '~/src/network/http.js'
import { OrderResultQuery } from './order.js'

export class HistoryQueryDownload extends QueryDownload {
    /* properties:
        isLoggedIn: Bool
        authToken: String
        userID: String
    */
    name = 'history'

    @computed get cacheKey() {
        return `qd:history:userID=${this.props.userID}`
    }

    @computed get active() {
        return this.props.isLoggedIn
    }

    @computed get query() {
        return {
            OrderHistory: {
                args: {
                    authToken: this.props.authToken,
                    n: 100,
                },
                result: {
                    orderHistory: [OrderResultQuery],
                }
            }
        }
    }

    @computed get orderHistory() {
        return this.lastValue
            ? this.lastValue.orderHistory
            : []
    }
}
