import React, { Component } from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'

import { T } from './AppText.js'
import { config } from './Config.js'
import { merge } from './Curry.js'

export class LargeButton extends Component {
    /* properties:
        label: str
        onPress: () => void
        primary: bool
        style: style object
        borderRadius: int
        prominent: bool
            if true, set a pink background color. Otherwise, set a white one.
        backgroundColor: str
        borderColor: str
    */
    static defaultProps = {
        primary: true,
        prominent: true,
        borderRadius: 10,
    }

    render = () => {
        return <TextButton
                    fontSize={25}
                    borderWidth={1.5}
                    {...this.props}
                    />
    }
}

export class TextButton extends Component {
    /* properties:
        primary: bool
        onPress() -> void
        fontSize: int
        borderWidth: int
        borderRadius: int
        label: str
        style: style object
        prominent: bool
        alignLeft: bool
        borderColor: str
    */

    static defaultProps = {
        primary: true,
        borderWidth: 2,
        prominent: true,
        borderRadius: 5,
        alignLeft: false,
    }

    render = () => {
        const textColor = this.props.prominent ? '#fff' : '#000'
        var text = <T ellipsizeMode='tail'
                        numberOfLines={1}
                        style={{fontSize: this.props.fontSize, color: textColor}}
                        >
                        {this.props.label}
                    </T>
        if (this.props.alignLeft)
            text = <View style={{flex: 1}}>{text}</View>

        return (
            <Button {...this.props}>
                {text}
            </Button>
        )
    }
}


export class Button extends Component {
    /* properties:
        primary: bool
        onPress() -> void
        borderWidth: int
        borderRadius: int
        style: style object
        prominent: bool
        children: [Component]
        backgroundColor: str
    */

    static defaultProps = {
        primary: true,
        borderWidth: 2,
        borderRadius: 5,
        prominent: true,
    }

    render = () => {
        const buttonStyle = this.props.prominent
            ? ( this.props.primary
                    ? { background: config.theme.primary.medium, border: config.theme.primary.dark }
                    : { background: config.theme.primary.dark, border: config.theme.primary.medium }
              )
            : ( this.props.primary
                    ? { background: '#fff', border: config.theme.primary.medium }
                    : { background: '#fff', border: config.theme.primary.dark }
              )

        if (this.props.backgroundColor)
            buttonStyle.background = this.props.backgroundColor
        if (this.props.borderColor)
            buttonStyle.border = this.props.borderColor

        return <TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={
                        { flex: 1
                        // , flexWrap: 'wrap'
                        , flexDirection: 'row'
                        , justifyContent: 'center'
                        , alignItems: 'center'
                        , borderWidth: this.props.borderWidth
                        , backgroundColor: buttonStyle.background
                        , borderColor: buttonStyle.border
                        , borderRadius: this.props.borderRadius
                        , padding: 5
                        }
                    }>
                    {this.props.children}
                </View>
            </View>
        </TouchableOpacity>
    }
}
