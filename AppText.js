import React, { Component } from 'react'
import { Text } from 'react-native'
import { merge } from './Curry.js'

export class T extends Component {
    /* properties:
        style
        numberOfLines
        lineBreakMode
    */
    render = () => {
        const style = merge({fontFamily: 'Roboto'}, this.props.style)
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            lineBreakMode={this.props.lineBreakMode}
            >
            {this.props.children}
        </Text>
    }
}
