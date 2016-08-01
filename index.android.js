/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import Swiper from 'react-native-swiper'
// import Carousel from 'react-native-carousel'
import Carousel from 'react-native-carousel-control'

import { Main } from './Main.js'

class App extends Component {
    render = () => {
        return <Main />
    }
}

AppRegistry.registerComponent('AwesomeProject', () => App);

// Testing

class ListViewBasics extends Component { // Initialize the hardcoded data
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            dataSource: ds.cloneWithRows(_.range(100))
        };
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    {_.range(100).map((i) => <Text key={i}>{i}</Text>)}
                </ScrollView>
            </View>
        )
        return (
            <View style = {{paddingTop: 22, flex: 1}}>
                <ListView dataSource={this.state.dataSource}
                          renderRow={(rowData) => <Text>{rowData}</Text>}
                          />
            </View>
        )
    }
}

// AppRegistry.registerComponent('AwesomeProject', () => ListViewBasics);

class JustifyContentBasics extends Component {
    render() {
        return (
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'powderblue'}} />
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'skyblue'}} />
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'steelblue'}} />
            </View>
        );
    }
};

// AppRegistry.registerComponent('AwesomeProject', () => JustifyContentBasics);
