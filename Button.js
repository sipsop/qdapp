import React, { Component } from 'react';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'

export class Button extends Component {
    /* properties:
        label: str
        onPress: () => void
    */
    render = () => {
        return <TouchableOpacity onPress={this.props.onPress}>
            <Text style={{fontSize: 25, textDecorationLine: 'underline'}}>
                {this.props.label}
            </Text>
        </TouchableOpacity>
    }
}
