import { computed } from 'mobx'
import { QueryMutation } from '/network/http'

export class UpdateBarStatusDownload extends QueryMutation {
    /* properties:
        barID: String
        authToken: String
        statusUpdate: StatusUpdate
    */
    name = 'bar status update'

    @computed get active() {
        return this.statusUpdate != null
    }

    @computed get query() {
        return {
            BarStatus: {
                args: {
                    barID: this.props.barID,
                    authToken: this.props.authToken,
                    statusUpdate: this.props.statusUpdate,
                },
                result: {
                    bar_status: {
                        qdodger_bar:      'Bool',
                        taking_orders:    'Bool',
                        table_service:    'String',
                        pickup_locations: [{
                            name: 'String',
                            open: 'Bool',
                        }],
                    }
                }
            }
        }
    }

    @computed get barStatus() {
        return this.lastValue && this.lastValue.bar_status
    }
}
