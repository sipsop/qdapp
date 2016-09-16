import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { T } from './AppText.js'
import { PureComponent } from './Component.js'
import { config } from './Config.js'

const rowHeight = 55

export class RowTextButton extends PureComponent {
    /* properties:
        onPress() -> void
        icon: Component
        text: str
        fontColor: String
        borderBottomColor: String
    */
    render = () => {
        return <RowButton {...this.props}>
            <RowText text={this.props.text} fontColor={this.props.fontColor} />
        </RowButton>
    }
}

export class RowButton extends PureComponent {
    /* properties:
        onPress() -> void
        borderBottomColor
        icon: Component
            optional icon
    */

    static defaultProps = {
        borderBottomColor: config.theme.primary.medium,
    }

    render = () => {
        return (
            <TouchableOpacity
                    style={
                        { flex: 0
                        , height: rowHeight
                        , borderBottomWidth: 0.5
                        , borderBottomColor: this.props.borderBottomColor
                        , marginLeft: 10
                        , marginRight: 10
                        }
                    }
                    onPress={this.props.onPress}
                    >
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{width: 55, height: rowHeight, justifyContent: 'center', alignItems: 'center'}}>
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

export class RowText extends PureComponent {
    /* properties:
        text: str
        style: style object
        fontColor: String
    */
    render = () => {
        return <T style={{fontSize: 20, color: this.props.fontColor, ...this.props.style}}>
            {this.props.text}
        </T>
    }
}
