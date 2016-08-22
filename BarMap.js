import React, { Component } from 'react';
import {
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import MapView from 'react-native-maps'
import merge from 'merge'

import { PureComponent } from './Component.js'
import { store } from './Store.js'
import { config } from './Config.js'
import { Map } from './Map.js'

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

    @observable allMarkers = [
        {
            id: '0',
            signedUp: false,
            name: "Some Other Pub",
            desc: "This is some other pub.",
            barType: 'Pub',
            address: {
                lat: 52.207990,
                lon: 0.121703,
            },
            selected: false,
        },
        {
            id: '1',
            signedUp: true,
            name: "The Eagle",
            desc: "The Eagle is a traditional English pub.",
            barType: 'Pub',
            address: {
                lat: 52.204139,
                lon: 0.118045,
            },
            selected: false,
        },
        {
            id: '2',
            signedUp: true,
            name: 'Lola Lo',
            desc: 'Polynesian-themed nightclub',
            barType: 'Nightclub',
            address: {
                lat: 52.204519,
                lon: 0.120067,
            },
            selected: false,
        }
    ]

    @computed get markerMap() {
        return asMap(this.allMarkers)
    }
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
    constructor(props) {
        super(props)
        this.mapRef = null
        autorun(() => {
            if (locationStore.currentMarker)
                this.focusMap(locationStore.currentMarker)
        })
    }


    handleRegionChange = (region) => {
        locationStore.region = region
    }

    focusMap = (marker) => {
        if (!this.mapRef)
            return
        this.mapRef.animateToCoordinate(coords(marker))
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
                    ref={(mapRef) => {this.mapRef = mapRef}}
                    style={style}
                    showsUserLocation={true}
                    region={locationStore.region}
                    onRegionChange={this.handleRegionChange}
                    loadingEnabled={true}
                    >
                {
                    locationStore.allMarkers.map(marker =>
                        <MapMarker key={marker.id} marker={marker} />
                    )
                }
                </MapView>
            </View>
        )
    }
}

const coords = (marker) => {
    return {
        latitude: marker.address.lat,
        longitude: marker.address.lon,
    }
}

class MapMarker extends PureComponent {
    /* properties:
        marker: Marker
    */
    constructor(props) {
        super(props)
        this.markerRef = null
        autorun(() => {
            if (locationStore.currentMarker) {
                // this.markerRef.showCallout()
            }
        })
    }

    @action handleMarkerSelect = () => {
        locationStore.currentMarker = this.props.marker
    }

    render = () => {
        const marker = this.props.marker
        const description =
            marker.signedUp
                ? marker.desc
                : marker.desc + "(menu unknown)"
        return <MapView.Marker
            ref={markerRef => {this.markerRef = markerRef}}
            coordinate={coords(marker)}
            title={marker.name}
            description={description}
            pinColor={getMarkerColor(marker)}
            onPress={this.handleMarkerSelect}
            />
    }
}
