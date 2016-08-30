//@flow

import React, { Component } from 'react'
import { observable, action, autorun, computed, asMap } from 'mobx'

import { store } from '../Store.js'
import { emptyResult } from '../HTTP.js'
import { logErrors } from '../Curry.js'
import { searchNearby } from './Nearby.js'

type Key = string

type Coords = {
    latitude: number,
    longitude: number,
}

type Delta = {
    latitudeDelta: number,
    longitudeDelta: number,
}

type Region = {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
}


const APIKey : Key = 'AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw'

const initialLocation : Coords = {
    latitude: 52.207990,
    longitude: 0.121703,
}

const focusDelta : Delta = {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

const normalDelta : Delta = {
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
}

class LocationStore {
    @observable currentLocation : Coords = initialLocation
    @observable region : Region = {
        ...initialLocation,
        ...normalDelta,
    }

    @observable currentMarkerCoords : ?Coords = null
    @observable currentLocation : Coords = initialLocation
    @observable nearbyBarDownloadResult : DownloadResult = emptyResult()
    @observable searchRadius : number = 5000 // 5 kilometer search radius

    constructor() {
        this.mapView = null
    }

    @action focusBar = (coords : Coords) => {
        if (this.mapView) {
            region = merge(coords, focusDelta)
            this.mapView.animateToRegion(region, 500)
        }
        this.currentMarkerCoords = coords
        store.switchToDiscoverPage(true)
    }

    refreshNearbyBars = action(logErrors(async () => {
        const { latitude, longitude } = this.currentLocation
        const searchResults = await searchNearby(APIKey, latitude, longitude, this.searchRadius)
        this.searchResults = searchResults
    }))

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
