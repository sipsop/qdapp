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
  View
} from 'react-native';

class Main extends Component {
    render() {
        const url = "http://blog.laterooms.com/wp-content/uploads/2014/01/The-Eagle-Cambridge.jpg"
        return (
            <View style={styles.container}>
                <Image source={{uri: url}} style={{width: 100, height: 100}} />
                <Text style={styles.welcome}>
                    We are going to deliver a lot of beerz!
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

AppRegistry.registerComponent('AwesomeProject', () => Main);
