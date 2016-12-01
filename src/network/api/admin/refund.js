import { computed } from 'mobx'
import { QueryMutation } from '/network/http'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/admin/complete-order')

export class RefundOrderDownload extends QueryMutation {
    /* properties:
        authToken: String
        barID: String
        orderID: String
        refundItems: Array<RefundOrderItem>
        reason: ?String
    */
    name = 'complete order'

    @computed get query() {
        return {
            RefundOrder: {
                args: this.props,
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
