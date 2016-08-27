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

import { PureComponent } from './Component.js'
import { Map } from './Map.js'
import { merge } from './Curry.js'
import { store, tabStore } from './Store.js'
import { config } from './Config.js'


// Search:
//
// https://maps.googleapis.com/maps/api/geocode/json?&address=Cambridge,UK
//

const focusDelta = {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

class LocationStore {
    @observable region = {
        latitude: 52.207990,
        longitude: 0.121703,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    }

    @observable currentMarker = null

    constructor() {
        this.mapView = null
    }

    @action focusBar = (bar) => {
        if (this.mapView) {
            region = merge(coords(bar), focusDelta)
            this.mapView.animateToRegion(region, 500)
        }
        this.currentMarker = bar
        store.switchToDiscoverPage(true)
    }

    @observable barMarkers = [
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
    }

    @action handleRegionChange = (region) => {
        locationStore.region = region
    }

    @action handleMapPress = (value) => {
        locationStore.currentMarker = null
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
                    ref={mapView => {locationStore.mapView = mapView}}
                    style={style}
                    /* NOTE: You need to add NSLocationWhenInUseUsageDescription key in Info.plist to enable geolocation, otherwise it is going to fail silently! */
                    showsUserLocation={true}
                    region={locationStore.region}
                    onRegionChange={this.handleRegionChange}
                    loadingEnabled={true}
                    loadingIndicatorColor={config.theme.primary.medium}
                    onPress={this.handleMapPress}
                    >
                {
                    locationStore.barMarkers.map(bar =>
                        <MapMarker key={bar.id} bar={bar} />
                    )
                }
                </MapView>
            </View>
        )
    }
}

const coords = (bar) => {
    return {
        latitude: bar.address.lat,
        longitude: bar.address.lon,
    }
}

class MapMarker extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
    constructor(props) {
        super(props)
        this.markerRef = null
        autorun(() => {
            if (this.selected && this.markerRef)
                this.markerRef.showCallout()
            else if (this.markerRef)
                this.markerRef.hideCallout()
        })
    }

    @action handleMarkerPress = () => {
        console.log("Setting currentMarker", this.props.bar.id)
        locationStore.currentMarker = this.props.bar
    }

    @action handleCalloutPress = () => {
        store.setBarID(this.props.bar.id)
        tabStore.setCurrentTab(1)
    }

    @computed get selected() {
        if (!locationStore.currentMarker)
            return false
        return this.props.bar.id === locationStore.currentMarker.id
    }

    render = () => {
        const bar = this.props.bar
        const title =
            bar.signedUp
                ? bar.name
                : bar.name + ' (menu unavailable)'

        const description =
            bar.signedUp
                ? bar.desc
                : bar.desc
        return <MapView.Marker
            ref={markerRef => {this.markerRef = markerRef}}
            coordinate={coords(bar)}
            title={title}
            description={description}
            pinColor={getMarkerColor(bar)}
            onPress={this.handleMarkerPress}
            onCalloutPress={this.handleCalloutPress}
            />
    }
}
