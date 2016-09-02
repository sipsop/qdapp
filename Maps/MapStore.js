// @flow

import { observable, action, autorun, computed, asMap } from 'mobx'

import { store } from '../Store.js'
import { DownloadResult, emptyResult } from '../HTTP.js'
import { logErrors, logger } from '../Curry.js'
import { searchNearby } from './Nearby.js'
import { getPlaceInfo } from './PlaceInfo.js'
import { merge } from '../Curry.js'

import type { Bar } from '../Bar/Bar.js'
import type { SearchResponse } from './Nearby.js'

const log = logger("Maps/MapStore.js")

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

export const APIKey : Key = 'AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw'

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

export const distance = (c1 : Coords, c2 : Coords) : Float => {
    const a = c1.latitude - c2.latitude
    const b = c2.longitude - c2.longitude
    return Math.sqrt(a*a + b*b)
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
    @observable lastSelectedMarker : ?Bar = null

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

    @computed get focusPoint() {
        if (this.lastSelectedMarker)
            return getBarCoords(this.lastSelectedMarker)
        return this.currentLocation
    }

    getCurrentMarker = () : ?Coords => {
        return this.currentMarker
    }

    @action setCurrentMarker = (bar : Bar) => {
        this.currentMarker = bar
        if (bar != null) {
            this.lastSelectedMarker = bar
        }
    }

    /* Focus the given bar on the map */
    @action focusBar = (bar : Bar) => {
        if (this.mapView != null) {
            const coords = getBarCoords(bar)
            const region = { ...coords, ...focusDelta }
            this.mapView.animateToRegion(region, 500)
            store.switchToDiscoverPage(true)
        }
        this.setCurrentMarker(bar)
    }

    searchNearby = async (barType = 'bar') : Promise<DownloadResult<SearchResponse>> => {
        return await searchNearby(
            APIKey,
            this.currentLocation,
            this.searchRadius,
            barType,
        )
    }

    getNearbyBarsDownloadResult = () : DownloadResult<SearchResponse> => {
        return this.searchResponse
    }

    updateNearbyBars = action(async () : void => {
        this.searchResponse.downloadStarted()
        this.searchResponse = await this.searchNearby('bar')
    })

    @computed get allMarkers() : Array<Bar> {
        if (this.searchResponse.value == null)
            return []
        return this.searchResponse.value.results
    }

    @computed get barList() : Array<Bar> {
        if (this.searchResponse.value == null)
            return []
        return this.searchResponse.value.results
    }

    @computed get nearbyBarList() : Array<Bar> {
        return this.sortResults(this.barList)
    }

    sortResults = (bars : Array<Bar>) : Array<Bar> => {
        const focusPoint = this.focusPoint
        const results = bars.slice()
        results.sort((bar1, bar2) => {
            const c1 = getBarCoords(bar1)
            const c2 = getBarCoords(bar2)
            const d1 = distance(focusPoint, c1)
            const d2 = distance(focusPoint, c2)
            if (d1 < d2)
                return -1
            else if (d1 > d2)
                return 1
            else
                return 0
        })
        return results
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
