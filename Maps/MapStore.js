// @flow

import { observable, action, autorun, computed, asMap, transaction } from 'mobx'

import { store } from '../Store.js'
import { DownloadResult, emptyResult } from '../HTTP.js'
import { searchNearbyFirstPage, searchNearbyAllPages } from './Nearby.js'
import { getPlaceInfo } from './PlaceInfo.js'
import { Second } from '../Time.js'
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


/****************************************************************************

    Distance Calulations

        http://www.movable-type.co.uk/scripts/latlong.html

****************************************************************************/

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

export const distance = (c1 : Coords, c2 : Coords) : Float => {
    var R = 6371e3 // metres
    var φ1 = c1.latitude.toRadians()
    var φ2 = c2.latitude.toRadians()
    var Δφ = (c2.latitude - c1.latitude).toRadians()
    var Δλ = (c2.longitude - c1.longitude).toRadians()

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    var d = R * c
    return d
}

// export const distance = (c1 : Coords, c2 : Coords) : Float => {
//     const a = c1.latitude - c2.latitude
//     const b = c2.longitude - c2.longitude
//     return Math.sqrt(a*a + b*b)
// }

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
    @observable allowBarListReordering : Bool = false

    mapView : ?NativeMapView

    constructor() {
        this.mapView = null
        this.watchID = null
    }

    initialize = async () => {
        _.safeAutorun(() => {
            if (mapStore.followUserLocation) {
                log("START LOCATION TRACKING")
                mapStore.trackLocation()
            } else if (mapStore.watchID != null) {
                log("STOP LOCATION TRACKING")
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
        this.currentMarker      = mapState.currentMarker
        this.lastSelectedMarker = mapState.currentMarker
        this.currentLocation    = mapState.currentLocation
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
        /* Use the old location until we get an update */
        if (this.currentLocation) {
            this.updateLocation({
                coords: this.currentLocation,
            })
        }

        /* Improve with a fresh rough estimate */
        // navigator.geolocation.getCurrentPosition(
        //     this.updateLocation,
        //     (error) => _.logError(error.message),
        // )

        /* Keep tracking with higher accuracy */
        this.watchID = navigator.geolocation.watchPosition(
            _.throttler(this.updateLocation, 5*Second).run,
            (error) => _.logError(error.message),
            {enableHighAccuracy: true}, //, timeout: 20000, maximumAge: 1000},
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
            // log("BAR FOCUS POINT", this.lastSelectedMarker.name)
            return getBarCoords(this.lastSelectedMarker)
        }
        // log("CURRENT LOCATION FOCUS POINT")
        return this.currentLocation
    }

    getCurrentMarker = () : ?Coords => {
        return this.currentMarker
    }

    /* Select or de-select a marker */
    @action setCurrentMarker = (bar : Bar) => {
        this.allowBarListReordering = true
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
        return await searchNearbyAllPages( // searchNearbyFirstPage(
            APIKey,
            initialLocation,    // this.currentLocation,
            this.searchRadius,
            barType,
            true,
        )
    }

    getNearbyBarsDownloadResult = () : DownloadResult<SearchResponse> => {
        return this.searchResponse
    }

    updateNearbyBars = async () : void => {
        this.searchResponse.downloadStarted()
        this.searchResponse = await this.searchNearby('bar')
    }

    /* Initial batch of downloaded bars */
    @computed get initialBatch() : Array<Bar> {
        if (this.searchResponse.value == null)
            return []
        return this.searchResponse.value.results
    }

    /* Remaining batch of downloaded bars */
    @computed get remainingBatch() : Array<Bar> {
        return []
    }

    /* Compute the list of nearby bars.

    We retrieve bar info from google maps in batches, and we do not want the
    bar list to be reordered as the user has scrolled midway in. So we only
    only allow re-ordering when we were re-ordering anyway (i.e. when the
    user has selected a new bar).
    */
    @computed get nearbyBarList() : Array<Bar> {
        if (this.allowBarListReordering) {
            const entireBatch = [...this.initialBatch, ...this.remainingBatch]
            return _.unique(this.sortResults(entireBatch))
        } else {
            const initialBatch = this.sortResults(this.initialBatch)
            const remainingBatch = this.sortResults(this.remainingBatch)
            return _.unique([...initialBatch, ...remainingBatch])
        }
    }

    /* All markers to be shown on the map.

    We do not reuse nearbyBarList here, as the bar list is re-arranged when
    selecting markers or moving location, which does not require updating the
    markers on the map!
    */
    @computed get allMarkers() : Array<Bar> {
        return _.unique([...this.initialBatch, ...this.remainingBatch])
    }

    distanceFromUser = (bar : Bar) : Float => {
        const coords = getBarCoords(bar)
        if (!this.currentLocation)
            return -1
        return distance(coords, this.currentLocation)
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
            mapStore.lastSelectedMarker = mapStore.currentMarker
        }
    }, 100)
})
