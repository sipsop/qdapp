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
import Picker from 'react-native-wheel-picker'
var PickerItem = Picker.Item;

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

var AwesomeProject = React.createClass({

  getInitialState: function() {
    return {
      selectedItem : 2,
      itemList: ['1', '2', '3', '4', '5', '6']
    }
  },

  onPikcerSelect: function(index) {
    this.setState({
      selectedItem: index,
    })
  },

  onAddItem: function() {
    var name = 'name'
    if (this.state.itemList.indexOf(name) == -1) {
      this.state.itemList.push(name)
    }
    this.setState({
      selectedItem: 0,
    })
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Picker style={{width: 150, height: 180}}
          selectedValue={this.state.selectedItem}
          itemStyle={{color:"white", fontSize:26}}
          onValueChange={(index) => this.onPikcerSelect(index)}>
            {this.state.itemList.map((value, i) => (
              <PickerItem label={value} value={i} key={"money"+value}/>
            ))}
        </Picker>
        <Text style={{margin: 20, color: '#ffffff'}}>
          item is here：{this.state.itemList[this.state.selectedItem]}
        </Text>

        <Text style={{margin: 20, color: '#ffffff'}}
            onPress={this.onAddItem}>
          press over here
        </Text>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1962dd',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

// AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
