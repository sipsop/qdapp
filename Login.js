import { PureComponent, T } from './Component.js'
import Auth0Lock from 'react-native-lock'
import { observable, action, computed } from 'mobx'
import { getTime, Hour, Minute } from './Time.js'
import { config } from './Config.js'
import { segment } from './Segment.js'
import { DownloadResult, emptyResult, downloadManager, DownloadResultView } from './HTTP.js'
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

type UserProfile = {
    is_bar_owner: Bool,
    bars: Array<String>,
}

class LoginStore {
    @observable profile = null
    @observable tokenInfo : TokenInfo = null
    @observable loginError = null
    @observable deviceID = null

    /* For bar owners */
    @observable barOwnerProfileDownloadResult : DownloadResult<UserProfile> = emptyResult()

    refreshAfter = null
    expiresAfter = null

    getState = () => {
        return {
            profile:        this.profile,
            tokenInfo:      this.tokenInfo,
            refreshAfter:   this.refreshAfter,
            expiresAfter:   this.expiresAfter,
            deviceID:       this.deviceID,
        }
    }

    @action setState = (state) => {
        log("login state", state.refreshAfter, state.expiresAfter)
        this.profile      = state.profile
        this.tokenInfo    = state.tokenInfo
        this.refreshAfter = state.refreshAfter
        this.expiresAfter = state.expiresAfter
        this.deviceID     = state.deviceID || _.uuid()
        /* Segment recommends this is only called once or when traits change,
           but this seems easier
        */
        segment.setUserID(this.userOrDeviceID)
        segment.identify({
            email: this.email,
            name:  this.name,
        })
        if (this.isLoggedIn)
            this.setBarOwnerProfile()
    }

    login = (callbackSuccess, callbackError) => {
        if (this.shouldRefreshToken()) {
            // Refresh idToken
            this.refreshToken(callbackSuccess, callbackError)
        } else if (this.isLoggedIn) {
            // All done
            if (this.userID && this.deviceID)
                segment.alias(this.deviceID, this.userID)
            callbackSuccess()
        } else {
            // Log in first
            this.loginNow(callbackSuccess, callbackError)
        }
    }

    refreshToken = async (callbackSuccess, callbackError) => {
        var result
        log("Starting auth token refresh...")
        try {
            /* Try to refresh idToken */
            result = await lock.authenticationAPI()
                               .refreshToken(this.tokenInfo.refreshToken)
            assert(result.idToken != null)
        } catch (error) {
            /* There was some error, e.g. due to network.
               If the idToken hasn't expired, continue.
               Otherwise, prompt a login.
            */
            if (this.isTokenExpired())
                this.loginNow(callbackSuccess, callbackError)
            else
                callbackSuccess()
            return
        }
        log("Refresh token", result)
        // result.expiresIn
        this.setIdToken(result.idToken)
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
            this.setLoginInfo(profile, tokenInfo)
            this.setBarOwnerProfile()
            if (callbackSuccess) {
                callbackSuccess()
            }
        })
    }

    getAuthToken = () => this.tokenInfo && this.tokenInfo.idToken

    shouldRefreshToken = () => {
        return !this.getAuthToken() || !this.refreshAfter || getTime() > this.refreshAfter
    }

    isTokenExpired = () => {
        return !this.getAuthToken() || !this.expiresAfter || getTime() >= this.expiresAfter
    }

    setBarOwnerProfile = _.logErrors(async () => {
        this.barOwnerProfileDownloadResult.downloadStarted()
        this.barOwnerProfileDownloadResult = await downloadManager.query(
            'qd:bar:profile',
            {
                UserProfile: {
                    args: {
                        authToken: this.getAuthToken(),
                    },
                    result: {
                        profile: {
                            is_bar_owner: 'Bool',
                            'bars': ['String'],
                        }
                    }
                }
            },
            /* Refresh info on each startup / login */
            config.defaultRefreshCacheInfo,
        )
    })

    @computed get barOwnerProfile() : UserProfile {
        return this.barOwnerProfileDownloadResult.value &&
               this.barOwnerProfileDownloadResult.value.profile
    }

    @computed get isBarOwner() : Bool {
        return this.barOwnerProfile && this.barOwnerProfile.is_bar_owner
    }

    @computed get ownedBars() : Array<BarID> {
        return this.barOwnerProfile && this.barOwnerProfile.bars || []
    }

    @action logout = () => {
        this.profile = null
        this.tokenInfo = null
        this.refreshAfter = null
        this.expiresAfter = null
        segment.track('Logout')
    }

    @action setLoginInfo = (profile, tokenInfo) => {
        this.profile = profile
        this.tokenInfo = tokenInfo
        this.refreshTimeStamps()
    }

    @action setIdToken = (idToken) => {
        this.tokenInfo.idToken = idToken
        this.refreshTimeStamps()
    }

    @action refreshTimeStamps = () => {
        this.refreshAfter = getTime() + config.auth.refreshAfter
        this.expiresAfter = getTime() + config.auth.expiresAfter
    }

    @computed get isLoggedIn() {
        return this.profile && this.getAuthToken()
    }

    @computed get userID() {
        return this.profile ? this.profile.userId : null
    }

    @computed get userOrDeviceID() {
        return this.userID || this.deviceID
    }

    @computed get name() {
        return this.profile ? this.profile.name : null
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

_.safeAutorun(() => {
    segment.setUserID(loginStore.userOrDeviceID)
})
