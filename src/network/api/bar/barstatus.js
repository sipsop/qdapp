import { computed, transaction, action, autorun } from 'mobx'
// import { BarQueryDownload } from './barquery.js'
import { FeedDownload } from '/network/http'
import { config } from '/utils/config.js'

export class BarStatusDownload extends FeedDownload {
    /* properties:
        barID: String
    */

    name = 'bar status'

    // update bar status every 30s
    // cacheInfo = config.defaultRefreshCacheInfo
    // periodicRefresh = 30

    @computed get active() {
        return this.props.barID != null
    }

    @computed get cacheKey() {
        return `qd:${this.name}:barID=${this.props.barID}`
    }

    @computed get query() {
        return {
            BarStatus: {
                args: {
                    /* NOTE: Use require() to resolve cyclic dependency */
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
