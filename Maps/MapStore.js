// @flow

import { observable, action, autorun, computed, asMap } from 'mobx'

import { store } from '../Store.js'
import { DownloadResult, emptyResult } from '../HTTP.js'
import { logErrors } from '../Curry.js'
import { searchNearby } from './Nearby.js'
import { merge } from '../Curry.js'

import type { Bar } from '../Bar/Bar.js'
import type { SearchResponse } from './Nearby.js'

/*********************************************************************/

export type Key = string

export type Coords = {
    latitude: number,
    longitude: number,
}

export type Delta = {
    latitudeDelta: number,
    longitudeDelta: number,
}

export type Region = {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
}

type NativeMapView  = {
    animateToRegion: (region : Region, time : number) => void,
}

/*********************************************************************/

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


export const getBarCoords = (bar : Bar) => {
    return {
        latitude: bar.address.lat,
        longitude: bar.address.lon,
    }
}

class MapStore {
    @observable currentLocation : Coords = initialLocation
    @observable region : Region = {
        ...initialLocation,
        ...normalDelta,
    }

    @observable currentMarkerCoords : ?Coords = null
    @observable currentLocation : Coords = initialLocation
    @observable nearbyBarDownloadResult : DownloadResult<SearchResponse> = emptyResult()
    @observable searchRadius : number = 5000 // 5 kilometer search radius

    mapView : ?NativeMapView

    constructor() {
        this.mapView = null
    }

    getCurrentMarkerCoords = () : ?Coords => {
        return this.currentMarkerCoords
    }

    @action setCurrentMarker = (bar : Bar) => {
        this.currentMarkerCoords = getBarCoords(bar)
    }

    /* Focus the given bar on the map */
    @action focusBar = (bar : Bar) => {
        if (this.mapView != null) {
            const coords = getBarCoords(bar)
            const region = { ...coords, ...focusDelta }
            this.mapView.animateToRegion(region, 500)
        }
        this.setCurrentMarker(bar)
        store.switchToDiscoverPage(true)
    }

    getNearbyBars = async () => {
        return await searchNearby(
            APIKey,
            this.currentLocation,
            this.searchRadius,
            'bar',
        )
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

export const mapStore = new MapStore()
