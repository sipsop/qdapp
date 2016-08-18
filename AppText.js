import React, { Component } from 'react'
import { Text } from 'react-native'
import { merge } from './Curry.js'

import { PureComponent } from './Component.js'

export class T extends PureComponent {
    /* properties:
        style
        numberOfLines
        ellipsizeMode
    */
    render = () => {
        const style = merge({fontFamily: 'Roboto'}, this.props.style)
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            ellipsizeMode={this.props.ellipsizeMode}
            >
            {this.props.children}
        </Text>
    }
}
