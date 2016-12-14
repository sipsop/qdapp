import { computed } from 'mobx'
import { QueryMutation } from '/network/http'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/admin/complete-order')

export class CompleteOrderDownload extends QueryMutation {
    /* properties:
        authToken: String
        orderID: String
        shouldFetchMore: Bool
    */
    name = 'complete order'

    @computed get query() {
        assert(this.props.orderID != null)
        return {
            CompleteOrder: {
                args: {
                    authToken: this.props.authToken,
                    orderID:   this.props.orderID,
                },
                result: {
                    status: 'String',
                }
            }
        }
    }

    @computed get success() {
        return this.value && this.value.status === 'OK'
    }
}
