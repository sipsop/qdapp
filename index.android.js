/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
import _ from 'lodash'
import Swiper from 'react-native-swiper'
import { observable, computed, autorun } from 'mobx'
import { observer } from 'mobx-react/native'


// import PickerAndroid from 'react-native-picker-android';
// import MapView from 'react-native-maps'
import { handleBackButton } from './Backbutton.js'
import { Main } from './Main.js'
import { store } from './Store.js'
// import rootNode from './RelayTest.js'
import { MapView } from './Maps/MapView.js'


class App extends Component {
    render = () => {
        return <Main />
    }
}

handleBackButton()
store.initialize()
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

/*
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
*/

// AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);

// let Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid
// let PickerItem = Picker.Item
//
// let CAR_MAKES_AND_MODELS = {
//     amc: {
//         name: 'AMC',
//         models: ['AMX', 'Concord', 'Eagle', 'Gremlin', 'Matador', 'Pacer'],
//     },
//     alfa: {
//         name: 'Alfa-Romeo',
//         models: ['159', '4C', 'Alfasud', 'Brera', 'GTV6', 'Giulia', 'MiTo', 'Spider'],
//     },
//     aston: {
//         name: 'Aston Martin',
//         models: ['DB5', 'DB9', 'DBS', 'Rapide', 'Vanquish', 'Vantage'],
//     },
//     audi: {
//         name: 'Audi',
//         models: ['90', '4000', '5000', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q5', 'Q7'],
//     },
//     austin: {
//         name: 'Austin',
//         models: ['America', 'Maestro', 'Maxi', 'Mini', 'Montego', 'Princess'],
//     },
//     borgward: {
//         name: 'Borgward',
//         models: ['Hansa', 'Isabella', 'P100'],
//     },
//     buick: {
//         name: 'Buick',
//         models: ['Electra', 'LaCrosse', 'LeSabre', 'Park Avenue', 'Regal', 'Roadmaster', 'Skylark'],
//     },
//     cadillac: {
//         name: 'Cadillac',
//         models: ['Catera', 'Cimarron', 'Eldorado', 'Fleetwood', 'Sedan de Ville'],
//     },
//     chevrolet: {
//         name: 'Chevrolet',
//         models: ['Astro', 'Aveo', 'Bel Air', 'Captiva', 'Cavalier', 'Chevelle', 'Corvair', 'Corvette', 'Cruze', 'Nova', 'SS', 'Vega', 'Volt'],
//     },
// };
//
// class SomeScene extends React.Component {
//
//     constructor(props, context){
//         super(props, context);
//         this.state = {
//             carMake: 'cadillac',
//             modelIndex: 3,
//         }
//     }
//
//     render() {
//         let make = CAR_MAKES_AND_MODELS[this.state.carMake];
//         let selectionString = make.name + ' ' + make.models[this.state.modelIndex];
//         return (
//             <View>
//                 <Text>Please choose a make for your car:</Text>
//                 <Picker
//                     selectedValue={this.state.carMake}
//                     onValueChange={(carMake) => this.setState({carMake, modelIndex: 0})}>
//                     {Object.keys(CAR_MAKES_AND_MODELS).map((carMake) => (
//                         <PickerItem
//                             key={carMake}
//                             value={carMake}
//                             label={CAR_MAKES_AND_MODELS[carMake].name}
//                         />
//                     ))}
//                 </Picker>
//                 <Text>Please choose a model of {make.name}:</Text>
//                 <Picker
//                     selectedValue={this.state.modelIndex}
//                     key={this.state.carMake}
//                     onValueChange={(modelIndex) => this.setState({modelIndex})}>
//                     {CAR_MAKES_AND_MODELS[this.state.carMake].models.map((modelName, modelIndex) => (
//                         <PickerItem
//                             key={this.state.carMake + '_' + modelIndex}
//                             value={modelIndex}
//                             label={modelName}
//                         />
//                     ))}
//                 </Picker>
//                 <Text>You selected: {selectionString}</Text>
//             </View>
//         );
//     }
// }
//
// AppRegistry.registerComponent('AwesomeProject', () => SomeScene);

class CounterStore {
    @observable count = { value: { x: 0 }}

    // update actions
    increment = () => this.count.value.x += 1
    decrement = () => this.count.value.x -= 1
    commit    = (i) => this.count.value.x = i
}

const counterStore = new CounterStore()

@observer class MobxTest extends Component {

    render = () => {
        return <View>
            {this.renderValue()}
            <TouchableOpacity onPress={counterStore.increment}>
                <Text>Add One</Text>
            </TouchableOpacity>
            <OtherComponent  />
        </View>
    }

    renderValue = () => {
        return <Text>{counterStore.count.value.x}</Text>
    }
}

@observer class OtherComponent extends Component {
    @observable value = 0

    constructor(props) {
        super(props)
        autorun(() => {
            console.log("updating value from store...")
            this.value = counterStore.count.value.x
        })
    }

    handleButtonPress = () => {
        this.value = this.value - 1
    }

    commit = () => {
        counterStore.commit(this.value)
    }

    render = () => {
        return <View>
            <TouchableOpacity onPress={this.handleButtonPress}>
                <Text>Subtract one from {this.value}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.commit}>
                <Text>Commit value</Text>
            </TouchableOpacity>
        </View>
    }
}

// AppRegistry.registerComponent('AwesomeProject', () => MobxTest);

// console.log(rootNode)

// AppRegistry.registerComponent('AwesomeProject', () => MapView)
