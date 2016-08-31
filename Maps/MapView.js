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
import { mapStore, getBarCoords } from './MapStore.js'

const pubColor  = config.theme.primary.medium
const clubColor = config.theme.primary.medium // config.theme.secondary.light
const passiveColor = 'rgb(222, 151, 14)'

export class MapView extends PureComponent {
    constructor(props) {
        super(props)
        this.mapRef = null
    }

    @action handleRegionChange = (region) => {
        mapStore.region = region
    }

    @action handleMapPress = (value) => {
        mapStore.setCurrentMarker(null)
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
                    ref={mapView => {mapStore.mapView = mapView}}
                    style={style}
                    /* NOTE: You need to add NSLocationWhenInUseUsageDescription key in Info.plist to enable geolocation, otherwise it is going to fail silently! */
                    showsUserLocation={true}
                    region={mapStore.region}
                    onRegionChange={this.handleRegionChange}
                    loadingEnabled={true}
                    loadingIndicatorColor={config.theme.primary.medium}
                    onPress={this.handleMapPress}
                    >
                    {
                        mapStore.allMarkers.map(bar =>
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
        bar: Bar
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
        mapStore.setCurrentMarker(this.props.bar)
    }

    @action handleCalloutPress = () => {
        barStore.setBarID(this.props.bar.id)
        tabStore.setCurrentTab(1)
    }

    @computed get selected() {
        const currentMarker = mapStore.getCurrentMarker()
        if (!currentMarker)
            return false
        return this.props.bar.id === currentMarker.id
    }

    @computed get isSignedUp() {
        // TODO: implement
        return true
    }

    render = () => {
        const bar = this.props.bar
        const signedUp = this.isSignedUp
        const title =
            signedUp
                ? bar.name
                : bar.name + ' (menu unavailable)'

        const description =
            signedUp
                ? bar.desc
                : bar.desc

        const color =
            signedUp
                ? pubColor
                : passiveColor

        return <NativeMapView.Marker
            ref={markerRef => {this.markerRef = markerRef}}
            coordinate={getBarCoords(bar)}
            title={title}
            description={description}
            pinColor={pubColor}
            onPress={this.handleMarkerPress}
            onCalloutPress={this.handleCalloutPress}
            />
    }
}
