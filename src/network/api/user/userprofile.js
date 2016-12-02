import { toJS, computed } from 'mobx'
import { QueryDownload } from '/network/http'
import { getClearingProps } from './userquery'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/user/userprofile.js')

export class UserProfileDownload extends QueryDownload {
    /* properties:
        isLoggedIn: Bool
        authToken: String
        userID: String
    */

    name = 'user profile'
    cacheInfo = config.defaultRefreshCacheInfo

    @computed get cacheKey() {
        return `qd:userProfile:userID${this.props.userID}`
    }

    @computed get active() {
        return this.props.isLoggedIn
    }

    getClearingProps = getClearingProps

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
        log("GOT PROFILE:", this.state, this.value, this.lastValue)
        return this.lastValue && this.lastValue.profile
    }
}
