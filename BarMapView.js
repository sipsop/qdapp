import React, { Component } from 'react';
import {
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import MapView from 'react-native-maps'
import merge from 'merge'

import { store } from './Store.js'

// Search:
//
// https://maps.googleapis.com/maps/api/geocode/json?&address=Cambridge,UK
//

export class BarMapView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // 52.1988369,0.0849679
            region: {
                latitude: 52.207990,
                longitude: 0.121703,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            },
        }
    }

    handleRegionChange = (region) => {
      this.setState({ region: region })
    }

    render = () => {
        const style =  {
            flex: 1,
            // position: 'absolute',
            top:0,
            bottom:0,
            left:0,
            right:0,
        }

        const style2 = _.clone(style)
        style2.position = 'absolute'

        return (
            <View style={{flex: 0, height: 300}}>
                <MapView
                    style={style}
                    showsUserLocation = {true}
                    region={this.state.region}
                    onRegionChange={this.handleRegionChange}
                    // initialRegion={{
                    //   latitude: 37.78825,
                    //   longitude: -122.4324,
                    //   latitudeDelta: 0.0922,
                    //   longitudeDelta: 0.0421,
                    // }}
                    />
            </View>
        )
    }

}
