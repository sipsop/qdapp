// @flow

import { observable, action, autorun, computed, asMap, transaction } from 'mobx'

import { store } from '../Store.js'
import { DownloadResult, emptyResult } from '../HTTP.js'
import { searchNearby } from './Nearby.js'
import { getPlaceInfo } from './PlaceInfo.js'
import * as _ from '../Curry.js'

import type { Bar } from '../Bar/Bar.js'
import type { SearchResponse } from './Nearby.js'

const { log, assert } = _.utils("Maps/MapStore.js")

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
    @observable followUserLocation : Bool = false

    mapView : ?NativeMapView

    constructor() {
        this.mapView = null
        this.watchID = null
    }

    initialize = async () => {
        _.safeAutorun(() => {
            if (mapStore.followUserLocation) {
                mapStore.trackLocation()
            } else if (mapStore.watchID != null) {
                log("STOPPING LOCATION TRACKING")
                navigator.geolocation.clearWatch(this.watchID)
            }
        })
        await this.updateNearbyBars()
    }

    getState = () => {
        return {
            currentMarker:      this.currentMarker,
            currentLocation:    this.currentLocation,
            followUserLocation: this.followUserLocation,
        }
    }

    emptyState = () => {
        return {
            currentMarker:      null,
            currentLocation:    this.currentLocation,
            followUserLocation: true,
        }
    }

    @action setState = (mapState) => {
        this.currentMarker = mapState.currentMarker
        this.currentLocation = mapState.currentLocation
        this.lastSelectedMarker = mapState.currentMarker
        this.followUserLocation = mapState.followUserLocation || !mapState.currentMarker
    }

    @action follow = (followUserLocation) => {
        this.followUserLocation = followUserLocation
    }

    @action updateLocation = (position) => {
        log("UPDATING CURREnT LOCATION...", position)
        const location = {
            latitude:   position.coords.latitude,
            longitude:  position.coords.longitude,
        }
        const region = {
            ...location,
            ...normalDelta,
        }
        this.currentLocation = location
        this.region = region
    }

    trackLocation = () => {
        // navigator.geolocation.getCurrentPosition(
        //     this.updateLocation,
        //     (error) => {
        //         // alert(error.message)
        //         _.logError(error.message)
        //     },
        //     // {enableHighAccuracy: true, maximumAge: 1000},
        // )

        /* Use the old location until we get an update */
        if (this.currentLocation) {
            this.updateLocation({
                coords: this.currentLocation,
            })
        }
        this.watchID = navigator.geolocation.watchPosition(
            this.updateLocation,
            (error) => {
                // alert(error.message)
                // console.error(error)
                _.logError(error.message)
            },
            // {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
        )
    }

    /* User changed region, stop following user location */
    @action userChangedRegion = (region) => {
        this.follow(false)
        this.region = region
    }

    /* Determine what to focus on: a bar or the current location */
    @computed get focusPoint() {
        if (this.lastSelectedMarker && !this.followUserLocation) {
            return getBarCoords(this.lastSelectedMarker)
        }
        return this.currentLocation
    }

    getCurrentMarker = () : ?Coords => {
        return this.currentMarker
    }

    /* Select or de-select a marker */
    @action setCurrentMarker = (bar : Bar) => {
        this.currentMarker = bar
    }

    /* Focus the given bar on the map */
    @action focusBar = (bar : Bar, switchToDiscoverPage = true) => {
        if (this.mapView != null) {
            const coords = getBarCoords(bar)
            const region = { ...coords, ...focusDelta }
            this.mapView.animateToRegion(region, 500)
            if (switchToDiscoverPage)
                store.switchToDiscoverPage(true)
        }
        this.setCurrentMarker(bar)
        this.follow(false)
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

_.safeAutorun(() => {
    /* Set a timeout for updating the lastSelectedMarker, as
        updating this will re-render the bar list which may
        take some time, causing the UI to hang. Instead switch
        to the map with callout first, and show an updated bar
        list later.
    */
    mapStore.currentMarker
    setTimeout(() => {
        if (mapStore.currentMarker) {
            log("UPDATing lAST SELECTED MARKER!")
            mapStore.lastSelectedMarker = mapStore.currentMarker
        }
    }, 100)
})
