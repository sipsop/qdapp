import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { T } from './AppText.js'
import { PureComponent } from './Component.js'
import { config } from './Config.js'

const rowHeight = 55

export class RowButton extends PureComponent {
    /* properties:
        onPress() -> void
        icon: Component
            optional icon
    */
    render = () => {
        return (
            <TouchableOpacity
                    style={
                        { flex: 0
                        , height: rowHeight
                        , borderBottomWidth: 0.5
                        , borderBottomColor: config.theme.primary.medium
                        , marginLeft: 10
                        , marginRight: 10
                        }
                    }
                    onPress={this.props.onPress}
                    >
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{width: 40, height: rowHeight, justifyContent: 'center', alignItems: 'center'}}>
                        {this.props.icon}
                    </View>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        {this.props.children}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

export class RowTextButton extends PureComponent {
    /* properties:
        onPress() -> void
        icon: Component
        text: str
    */
    render = () => {
        return <RowButton icon={this.props.icon} onPress={this.props.onPress}>
            <RowText text={this.props.text} />
        </RowButton>
    }
}

export class RowText extends PureComponent {
    /* properties:
        text: str
    */
    render = () => {
        return <T style={{fontSize: 20, color: '#000'}}>
            {this.props.text}
        </T>
    }
}
