import Auth0Lock from 'react-native-lock'
import { observable, action } from 'mobx'

var lock = new Auth0Lock({
    clientId: 'phA8QFWKknNtcDwVefccBf82sIp4bw6c',
    domain: 'tuppu.eu.auth0.com',
})

const lockOpts = {
    closable: true,
    // code: true,
    // magicLink: true,
    connections: [/*"google", "facebook", "sms"*/ "github", "email", "touchid"],
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

    login = () => {
        if (this.userToken) {
            return
        }
        lock.show(lockOpts, (err, profile, userToken) => {
            if (err) {
                console.log("login error", err)
                return
            }
            // Authentication worked!
            this.setLoginInfo(profile, userToken)
        })
    }

    @action logout = () => {
        this.setLoginInfo(null, null)
    }

    @action setLoginInfo = (profile, userToken) => {
        this.profile = profile
        this.userToken = userToken
    }

    isLoggedIn = () => {
        return !!this.userToken
    }

    get userName() {
        return this.profile ? this.profile.nickname : null
    }

    get email() {
        return this.profile ? this.profile.email : null
    }

    get picture() {
        return this.profile ? this.profile.picture : null
    }
}

export const loginStore = new LoginStore()