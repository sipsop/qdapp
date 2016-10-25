import { QueryDownload } from '/network/http.js'
import { config } from './Config.js'

class BarOwnerProfileDownload extends QueryDownload {
    /* properties:
        isLoggedIn: Bool
        authToken: String
    */

    name = 'barOwnerProfile'
    cacheInfo = config.defaultRefreshCacheInfo

    @computed get cacheKey() {
        return `qd:barOwnerProfile:userID${stores.loginStore.userID}`
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
