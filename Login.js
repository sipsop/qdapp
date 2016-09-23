import Auth0Lock from 'react-native-lock'
import { observable, action, computed } from 'mobx'
import * as _ from './Curry.js'

const { log, assert } = _.utils('Login.js')

var lock = new Auth0Lock({
    clientId: 'phA8QFWKknNtcDwVefccBf82sIp4bw6c',
    domain: 'tuppu.eu.auth0.com',
})

const lockOpts = {
    closable: true,
    // code: true,
    // magicLink: true,
    connections: [/*"google", "facebook", "sms" "github",*/ "email", /* "touchid" */],
    authParams: {
        scope: "openid email offline_access",
    },
}

class LoginStore {
    @observable profile = null
    @observable userToken = null
    @observable loginError = null

    getState = () => {
        return {
            profile: this.profile,
            userToken: this.userToken,
        }
    }

    @action setState = (state) => {
        if (state) {
            this.profile = state.profile
            this.userToken = state.userToken
        }
    }

    login = (callbackSuccess, callbackError) => {
        if (this.userToken) {
            callbackSuccess()
            return
        }
        lock.show(lockOpts, (err, profile, userToken) => {
            if (err) {
                log("login error", err)
                if (callbackError)
                    callbackError()
                return
            }
            // Authentication worked!
            this.setLoginInfo(profile, userToken)
            if (callbackSuccess)
                callbackSuccess()
        })
    }

    @action logout = () => {
        this.setLoginInfo(null, null)
    }

    @action setLoginInfo = (profile, userToken) => {
        this.profile = profile
        this.userToken = userToken
    }

    @computed get isLoggedIn() {
        return !!this.userToken
    }

    @computed get userID() {
        log('profile', this.profile)
        return this.profile ? this.profile.userId : null
    }

    @computed get userName() {
        return this.profile ? this.profile.nickname : null
    }

    @computed get email() {
        return this.profile ? this.profile.email : null
    }

    @computed get picture() {
        return this.profile ? this.profile.picture : null
    }
}

export const loginStore = new LoginStore()
