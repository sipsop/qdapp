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
  PickerIOS,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import Swiper from 'react-native-swiper'
import { observable, computed, autorun } from 'mobx'
import { observer } from 'mobx-react/native'
import * as _ from './Curry.js'


// import PickerAndroid from 'react-native-picker-android';
// import MapView from 'react-native-maps'
import { Main } from './Main.js'
import { store } from './Store.js'
// import rootNode from './RelayTest.js'
import { MapView } from './Maps/MapView.js'


class App extends Component {
    render = () => {
        return <Main />
    }
}

AppRegistry.registerComponent('AwesomeProject', () => App);
