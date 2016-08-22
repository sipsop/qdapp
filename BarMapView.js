import React, { Component } from 'react';
import {
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import MapView from 'react-native-maps'
import merge from 'merge'

import { PureComponent } from './Component.js'
import { store } from './Store.js'
import { config } from './Config.js'

// Search:
//
// https://maps.googleapis.com/maps/api/geocode/json?&address=Cambridge,UK
//

class LocationStore {
    @observable region = {
        latitude: 52.207990,
        longitude: 0.121703,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    }

    @observable currentMarker = null

    allMarkers = [
        {
            id: 0,
            latitude: 52.207990,
            longitude: 0.121703,
            signedUp: false,
            title: "Some Other Pub",
            description: "This is some other pub.",
            barType: 'Pub',
        },
        {
            id: 1,
            latitude: 52.204139,
            longitude: 0.118045,
            signedUp: true,
            title: "The Eagle",
            description: "The Eagle is a traditional English pub.",
            barType: 'Pub',
        },
        {
            id: 2,
            latitude: 52.204519,
            longitude: 0.120067,
            signedUp: true,
            title: 'Lola Lo',
            description: 'Polynesian-themed nightclub',
            barType: 'Nightclub',
        }
    ]
}

export const locationStore = new LocationStore()

const pubColor  = config.theme.primary.medium
const clubColor = config.theme.primary.medium // config.theme.secondary.light
const passiveColor = 'rgb(222, 151, 14)'

const getMarkerColor = (marker) => {
    if (marker.signedUp) {
        if (marker.barType === 'Pub')
            return pubColor
        return clubColor
    }
    return passiveColor
}

export class BarMapView extends PureComponent {
    handleRegionChange = (region) => {
        locationStore.region = region
    }

    focusMap = (markers, animated) => {
        console.log("Markers received to populate map: " + markers);
        this.refs.map.fitToSuppliedMarkers(markers, animated);
    }

    render = () => {
        const style =  {
            flex: 1,
            // position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        }

        const style2 = _.clone(style)
        style2.position = 'absolute'

        return (
            <View style={{flex: 0, height: 300}}>
                <MapView
                    ref="map"
                    style={style}
                    showsUserLocation={true}
                    region={locationStore.region}
                    onRegionChange={this.handleRegionChange}
                    >
                {
                    locationStore.allMarkers.map(marker =>
                        <MapMarker marker={marker} />
                    )
                }
                </MapView>
            </View>
        )
    }
}

class MapMarker extends PureComponent {
    /* properties:
        marker: Marker
    */

    @action handleMarkerSelect = () => {
        locationStore.currentMarker = this.props.marker
    }

    render = () => {
        const marker = this.props.marker
        return <MapView.Marker
            key={marker.id}
            coordinate={marker}
            title={marker.title}
            description={marker.description}
            pinColor={getMarkerColor(marker)}
            onPress={this.handleMarkerSelect}
            />
    }
}
