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
    Modal,
} from 'react-native'
import Dimensions from 'Dimensions'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import * as _ from './Curry.js'

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

export class SimpleListView extends PureComponent {
    /* properties:
        renderRow(i : Int) => void
        N: Int
            total number of items
        renderHeader: ?() => Component
        renderFooter: ?() => Component
    */
    constructor(props) {
        super(props)
        this._dataSource = new ListView.DataSource({
            rowHasChanged: (i, j) => i !== j,
        })
    }

    get dataSource() {
        return this._dataSource.cloneWithRows(_.range(this.props.N + 2))
    }

    render = () => {
        return <ListView
                    dataSource={this.dataSource}
                    renderRow={this.renderRow} />
    }

    renderRow = (i) => {
        i -= 1
        if (i === -1)
            return this.props.renderHeader ? this.props.renderHeader() : <View />
        if (i === this.props.N)
            return this.props.renderFooter ? this.props.renderFooter() : <View />
        return this.props.renderRow(i)
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
        const children = this.props.children
        // if (Array.isArray(children))
        //     assert(_.all(children.map(isString)), "" + children)
        // else
        //     assert(isString(children), "" + children)
        return <Text
            style={style}
            numberOfLines={this.props.numberOfLines}
            ellipsizeMode={this.props.ellipsizeMode}
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
    Modal,
    /* Custom Components */
    PureComponent,
    T,
    Mono,
    /* External */
    Icon,
    EvilIcon,
    MaterialIcon,
}
