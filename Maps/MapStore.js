// @flow

import { observable, action, autorun, computed, asMap } from 'mobx'

import { store } from '../Store.js'
import { DownloadResult, emptyResult } from '../HTTP.js'
import { logErrors } from '../Curry.js'
import { searchNearby } from './Nearby.js'
import { getPlaceInfo } from './PlaceInfo.js'
import { merge } from '../Curry.js'

import type { Bar } from '../Bar/Bar.js'
import type { SearchResponse } from './Nearby.js'

/*********************************************************************/

export type Key = string
export type PlaceID = String

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

    @observable currentMarker : ?Bar = null
    @observable currentLocation : Coords = initialLocation
    @observable searchRadius : number = 5000 // 5 kilometer search radius
    @observable searchResponse : DownloadResult<SearchResponse> = emptyResult()

    mapView : ?NativeMapView

    constructor() {
        this.mapView = null
    }

    initialize = async () => {
        await this.updateNearbyBars()
    }

    getState = () => {
        return {
            currentMarker:   this.currentMarker,
            currentLocation: this.currentLocation,
        }
    }

    @action setState = (mapState) => {
        this.currentMarker = mapState.currentMarker
        this.currentLocation = mapState.currentLocation
    }

    getCurrentMarker = () : ?Coords => {
        return this.currentMarker
    }

    @action setCurrentMarker = (bar : Bar) => {
        this.currentMarker = bar
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

    searchNearby = async (barType = 'bar') : Promise<DownloadResult<SearchResponse>> => {
        return await searchNearby(
            APIKey,
            this.currentLocation,
            this.searchRadius,
            barType,
        )
    }

    updateNearbyBars = action(async () : void => {
        this.searchResponse = await this.searchNearby('bar')
    })

    @computed get allMarkers() : Array<Bar> {
        if (this.searchResponse.value == null)
            return []
        return this.searchResponse.value.results
    }

    @computed get nearbyBarList() : Array<Bar> {
        if (this.searchResponse.value == null)
            return []
        return this.searchResponse.value.results
    }

    getPlaceInfo = async (placeID : PlaceID) : Promise<DownloadResult<Bar>> => {
        return await getPlaceInfo(APIKey, placeID)
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
        }
    ]

}

export const mapStore = new MapStore()
