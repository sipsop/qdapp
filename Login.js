import Auth0Lock from 'react-native-lock'
import { observable, action } from 'mobx'

var lock = new Auth0Lock({
    clientId: 'phA8QFWKknNtcDwVefccBf82sIp4bw6c',
    domain: 'tuppu.eu.auth0.com',
})

const lockOpts = {
    closable: true,
    connections: ["email", "touchid"],
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
        console.log("Restoring login state...", state)
        if (state) {
            this.profile = state.profile
            this.userToken = state.userToken
        }
    }

    login = () => {
        if (this.userToken) {
            console.log("Already logged in", this.userToken, this.profile)
            return
        }
        lock.show(lockOpts, (err, profile, userToken) => {
            console.log("CALLBACK INVOKED!!!!!")
            if (err) {
                console.log("login error", err)
                return
            }
            // Authentication worked!
            this.setLoginInfo(profile, userToken)
        })
    }

    @action setLoginInfo = (profile, userToken) => {
        console.log("Set login info", profile, userToken)
        this.profile = profile
        this.userToken = userToken
    }

    get userName() {
        return this.profile ? this.profile.name : null
    }

    get email() {
        return this.profile ? this.profile.email : null
    }
}

export const loginStore = new LoginStore()
