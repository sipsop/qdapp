import { computed, transaction, action, autorun } from 'mobx'
import { QueryDownload } from '/network/http.js'
import { OrderResultQuery } from './order.js'
import { getClearingProps } from '../user/userquery'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/orders/history.js')

export type HistoryItem = {
    barID: String,
    orderID: String,
}

export const HistoryItemQuery = {
    barID: 'String',
    orderID: 'String',
}

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

    getClearingProps = getClearingProps

    @computed get query() {
        return {
            OrderHistory: {
                args: {
                    authToken: this.props.authToken,
                    n: 100,
                },
                result: {
                    orderHistory: [HistoryItemQuery],
                }
            }
        }
    }

    @computed get orderHistory() : Array<HistoryItem> {
        return this.lastValue
            ? this.lastValue.orderHistory
            : []
    }
}
