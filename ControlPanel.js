import React, { Component } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'

import { PureComponent } from './Component.js'
import { RowTextButton } from './Rows.js'
import { T } from './AppText.js'
import { loginStore } from './Store.js'



const icon = iconName => <Icon name={iconName} size={30} />

@observer
export class ControlPanel extends PureComponent {
    render = () => {
        return <View style={{flex: 1}}>
            <LoginInfo />
            <RowTextButton text="Orders" icon={icon("cog")} />
            <RowTextButton text="Payment" icon={icon("cog")} />
            <RowTextButton text="Settings" icon={icon("cog")} />
            {
                loginStore.isLoggedIn()
                    ? <RowTextButton
                        text="Sign Out"
                        icon={icon("sign-out")}
                        onPress={loginStore.logout}
                        />
                    : undefined
            }
        </View>
    }
}

@observer
class LoginInfo extends PureComponent {
    render = () => {
        return loginStore.isLoggedIn()
            ? this.renderLoggedIn()
            : this.renderLoggedOut()
    }

    renderLoggedIn = () => {
        return <View style={{flex: 0, height: 200, justifyContent: 'center', backgroundColor: '#000'}}>
            <View style={{flex: 0, height: 140, justifyContent: 'center', justifyContent: 'center', alignItems: 'center'}}>
                <Image source={{uri: loginStore.picture}} style={{width: 100, height: 100}} />
            </View>
            <View style={{flex: 1, marginTop: 10, alignItems: 'center'}}>
                {/*<T>{loginStore.userName}</T>*/}
                <T numberOfLines={2} style={{fontSize: 15, color: '#fff'}}>
                    {loginStore.email}
                </T>
            </View>
        </View>
    }

    renderLoggedOut = () => {
        return <RowTextButton
                    text="Sign In"
                    icon={icon("sign-in")}
                    onPress={loginStore.login}
                    />

    }
}
