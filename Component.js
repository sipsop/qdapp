import React, { Component } from 'react'
import {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    ScrollView,
    TextInput,
    ListView,
    RefreshControl,
    Slider,
    Platform,
    Picker,
    TouchableOpacity,
    Modal,
    Switch,
} from 'react-native'
import Dimensions from 'Dimensions'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import * as _ from './Curry.js'

const fontFamily = Platform.OS === 'android' ? 'Roboto' : 'Arial'

import { HOST } from './Host.js'
const { log, assert } = _.utils('./Component.js')

class PureComponent extends Component {
    constructor(props) {
        super(props)
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }
}

const isString = (s : String) => {
    return typeof(s) === 'string'
}

class T extends PureComponent {
    /* properties:
        style
        numberOfLines
        ellipsizeMode
    */
    render = () => {
        const style = {fontFamily: fontFamily, ...this.props.style}
        const children = this.props.children
        // if (Array.isArray(children))
        //     assert(_.all(children.map(isString)), "" + children)
        // else
        //     assert(isString(children), "" + children)
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            ellipsizeMode={this.props.ellipsizeMode}
            lineBreakMode={this.props.ellipsizeMode}
            >
            {this.props.children}
        </Text>
    }
}


class Mono extends PureComponent {
    /* properties:
        style
        numberOfLines
        ellipsizeMode
    */
    render = () => {
        const style = {fontFamily: "robotomono", ...this.props.style}
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            ellipsizeMode={this.props.ellipsizeMode}
            >
            {this.props.children}
        </Text>
    }
}


const getImageURL = (url : URL) => {
    if (!url)
        return null
    if (url.startsWith('/static'))
        return HOST + url
    return url
}

class Img extends PureComponent {
    /* properties:
        url: URL
        children: [Component]

        other props: passed to Image
    */
    render = () => {
        const url = getImageURL(this.props.url)
        return <Image source={{uri: url}} {...this.props}>
            {this.props.children}
        </Image>
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
    RefreshControl,
    Platform,
    Picker,
    TouchableOpacity,
    Modal,
    Switch,
    Slider,
    TextInput,
    /* Custom Components */
    PureComponent,
    T,
    Mono,
    /* External */
    Icon,
    EvilIcon,
    MaterialIcon,
    Img,
}
