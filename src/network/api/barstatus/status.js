import { computed } from 'mobx'
import { BarQueryDownload } from '../bar/barquery'
import { config } from '/utils/config'

export class BarStatusDownload extends BarQueryDownload {
    /* properties:
        barID: String
    */
    name = 'bar status'

    // update bar status every 30s
    cacheInfo = config.defaultRefreshCacheInfo
    periodicRefresh = 30

    @computed get query() {
        return {
            BarStatus: {
                args: {
                    barID: this.props.barID,
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
