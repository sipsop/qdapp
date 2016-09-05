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

import NativeMapView from 'react-native-maps'

import { PureComponent } from '../Component.js'
import { Map } from '../Map.js'
import { merge } from '../Curry.js'
import { store, tabStore, barStore } from '../Store.js'
import { config } from '../Config.js'



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

export class MapView extends PureComponent {
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
                <NativeMapView
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
                </NativeMapView>
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
        barStore.setBarID(this.props.bar.id)
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