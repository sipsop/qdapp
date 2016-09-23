import Auth0Lock from 'react-native-lock'
import { observable, action, computed } from 'mobx'
import { getTime, Hour } from './Time.js'
import * as _ from './Curry.js'

const { log, assert } = _.utils('Login.js')

const clientID = 'phA8QFWKknNtcDwVefccBf82sIp4bw6c'

var lock = new Auth0Lock({
    clientId: clientID,
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

type JWT = String

type TokenInfo = {
    // Token type, should be 'Bearer'
    type:           String,
    // Used to obtain new access tokens
    refreshToken:   String,
    // Pass to our servers for authorization
    idToken:        JWT,
    // Random identifier, used for Auth0 /userInfo and user management API
    accessToken:    String,
}

const idTokenExpiryTime = Hour

class LoginStore {
    @observable profile = null
    @observable tokenInfo : TokenInfo = null
    @observable loginError = null
    expiry = null

    getState = () => {
        return {
            profile: this.profile,
            tokenInfo: this.tokenInfo,
            expiry: this.expiry,
        }
    }

    @action setState = (state) => {
        this.setLoginInfo(state.profile, state.tokenInfo, state.expiry)
    }

    login = (callbackSuccess, callbackError) => {
        const loggedIn = this.isLoggedIn
        if (loggedIn && this.idTokenValid()) {
            // All done
            callbackSuccess()
        } else if (loggedIn) {
            // Refresh idToken
            this.refreshToken(callbackSuccess, callbackError)
        } else {
            // Log in first
            this.loginNow()
        }
    }

    refreshToken = async (callbackSuccess, callbackError) => {
        var result
        try {
            result = await lock.authenticationAPI()
                               .refreshToken(this.tokenInfo.refreshToken)
            assert(result.idToken != null)
        } catch (error) {
            this.loginNow(callbackSuccess, callbackError)
        }
        log("Refresh token", result)
        // result.expiresIn
        this.updateTokenInfo(result.idToken, getTime() + idTokenExpiryTime)
        callbackSuccess()
    }

    loginNow = (callbackSuccess, callbackError) => {
        lock.show(lockOpts, (err, profile, tokenInfo) => {
            if (err) {
                if (callbackError)
                    callbackError()
                return
            }
            // Authentication worked!
            const expiry = getTime() + idTokenExpiryTime
            this.setLoginInfo(profile, tokenInfo, expiry)
            if (callbackSuccess)
                callbackSuccess()
        })
    }

    getAuthToken = () => this.tokenInfo.idToken

    @action logout = () => {
        this.setLoginInfo(null, null)
    }

    @action setLoginInfo = (profile, tokenInfo, expiry) => {
        log("Setting login info", profile, 'tokenInfo', tokenInfo, "expiry", expiry)
        this.profile = profile
        this.tokenInfo = tokenInfo
        this.expiry = expiry
    }

    @action updateTokenInfo = (idToken, expiry) => {
        log("UPdating token info", idToken, "expiry", expiry)
        this.tokenInfo.idToken = idToken
        this.expiry = expiry
    }

    @computed get isLoggedIn() {
        return this.profile && this.tokenInfo
    }

    idTokenValid = () => {
        return this.tokenInfo &&
               this.tokenInfo.idToken &&
               this.expiry &&
               this.expiry < getTime()
    }

    @computed get userID() {
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
