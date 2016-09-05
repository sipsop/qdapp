import React, { Component } from 'react'
import {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ListView,
    Platform,
    Picker,
    TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import PureRenderMixin from 'react-addons-pure-render-mixin'

class PureComponent extends Component {
    constructor(props) {
        super(props)
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }
}

class T extends PureComponent {
    /* properties:
        style
        numberOfLines
        ellipsizeMode
    */
    render = () => {
        const style = {fontFamily: 'Roboto', ...this.props.style}
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            ellipsizeMode={this.props.ellipsizeMode}
            >
            {this.props.children}
        </Text>
    }
}

export {
    /* React */
    React,
    Component,
    /* React Native */
    Dimensions,
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ListView,
    Platform,
    Picker,
    TouchableOpacity,
    /* Custom Components */
    PureComponent,
    T,
    /* External */
    Icon,
    EvilIcon,
}
