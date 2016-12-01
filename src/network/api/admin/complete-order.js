import { computed } from 'mobx'
import { QueryMutation } from '/network/http'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/admin/status-update')

export class UpdateBarStatusDownload extends QueryMutation {
    /* properties:
        authToken: String
        orderID: String
    */
    name = 'bar status update'

    @computed get query() {
        assert(this.props.statusUpdate != null)
        return {
            UpdateBarStatus: {
                args: {
                    barID: this.props.barID,
                    authToken: this.props.authToken,
                    statusUpdate: this.props.statusUpdate,
                },
                result: {
                    status: 'String',
                }
            }
        }
    }
}
