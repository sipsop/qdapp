import { computed } from 'mobx'
import { QueryMutation } from '/network/http.js'

export class RegisterUser extends QueryMutation {
    /* properties:
        authToken: String
        email: String,
        firebaseToken: ?String
    */

    name = 'register user'
    autoDownload = true

    @computed get active() {
        return this.props.email != null && this.props.fireToken != null
    }

    @computed get query() {
        const profileParams = {
            email: this.props.email
        }
        if (this.props.firebaseToken)
            profileParams.firebaseToken = this.props.firebaseToken

        return {
            RegisterUser: {
                args: {
                    authToken: this.props.authToken,
                    profileParams: profileParams,
                },
                result: {
                    success: 'Bool',
                }
            }
        }
    }
}
