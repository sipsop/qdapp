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

import PureRenderMixin from 'react-addons-pure-render-mixin'

class PureComponent extends Component {
    constructor(props) {
        super(props)
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }
}

export {
    React,
    Component,
    PureComponent,
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
}
