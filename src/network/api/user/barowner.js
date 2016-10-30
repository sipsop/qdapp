import { computed } from 'mobx'
import { QueryDownload } from '~/src/network/http.js'
import { config } from '~/src/utils/config.js'

export class BarOwnerProfileDownload extends QueryDownload {
    /* properties:
        isLoggedIn: Bool
        authToken: String
        userID: String
    */

    name = 'barOwnerProfile'
    cacheInfo = config.defaultRefreshCacheInfo

    @computed get cacheKey() {
        return `qd:barOwnerProfile:userID${this.props.userID}`
    }

    @computed get active() {
        return this.props.isLoggedIn
    }

    @computed get query() {
        return {
            UserProfile: {
                args: {
                    authToken: this.props.authToken,
                },
                result: {
                    profile: {
                        is_bar_owner: 'Bool',
                        'bars': ['String'],
                    }
                }
            }
        }
    }

    @computed get profile() {
        return this.lastValue.profile
    }
}
