// @flow

import { observable, action, autorun, computed, asMap, transaction } from 'mobx'

import { store, barStore, segment } from './store.js'
import { DownloadResult, emptyResult } from '~/network/http.js'
import { searchNearbyFirstPage, searchNearbyAllPages } from '~/network/api/maps/nearby.js'
import { Second } from '~/utils/time.js'
import * as _ from '~/utils/curry.js'
import { analytics } from '~/model/analytics.js'
import { config } from '~/utils/config.js'

import type { Bar } from './barstore.js'
import type { SearchResponse } from '~/network/api/maps/nearby.js'

const { log, assert } = _.utils("model/mapstore.js")

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

const initialLocation : Coords = {
    latitude: 52.207990,
    longitude: 0.121703,
}

const focusDelta : Delta = {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

const normalDelta : Delta = {
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
}


export const getBarCoords = (bar : Bar) => {
    if (!bar.address)
        log("DO NOT HAVE AN ADDRESS", bar)
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
    let R = 6371e3 // metres
    let φ1 = c1.latitude.toRadians()
    let φ2 = c2.latitude.toRadians()
    let Δφ = (c2.latitude - c1.latitude).toRadians()
    let Δλ = (c2.longitude - c1.longitude).toRadians()

    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    let d = R * c
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
    @observable searchRadius : number = 7000 // 5 kilometer search radius
    @observable searchResponse : DownloadResult<SearchResponse> = emptyResult()
    @observable searchResponse1 : DownloadResult<SearchResponse> = emptyResult()
    @observable searchResponse2 : DownloadResult<SearchResponse> = emptyResult()
    @observable lastSelectedMarker : ?Bar = null
    @observable canReorderBarList : Bool = false
    @observable moreButtonLoading : Bool = false
    @observable moreButtonEnabled : Bool = false

    mapView : ?NativeMapView

    constructor() {
        this.mapView = null
        this.watchID = null
        this.animateToUserLocation = false
    }

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    getState = () => {
        return {
            currentMarker:      this.currentMarker,
            currentLocation:    this.currentLocation,
            // region:             this.region,
        }
    }

    emptyState = () => {
        return {
            currentMarker:      null,
            currentLocation:    this.currentLocation,
            // region:             this.region,
        }
    }

    @action setState = (mapState) => {
        this.currentMarker      = /* barStore.getBar() || */ mapState.currentMarker
        this.lastSelectedMarker = mapState.currentMarker
        this.currentLocation    = mapState.currentLocation
        // this.region             = mapState.region
        if (this.currentMarker) {
            this.focusBar(this.currentMarker, false)
        } else {
            this.animateToUserLocation = true
        }
    }

    initialize = () => {

    }

    initialized = async () => {
        // setTimeout(this.trackLocation, 2000)
        mapStore.trackLocation()
        /* TODO: Declarative downloads */
        await this.updateNearbyBars()
    }

    /*********************************************************************/
    /* Location Tracking                                                 */
    /*********************************************************************/

    @action updateLocation = (position) => {
        const location = {
            latitude:   position.coords.latitude,
            longitude:  position.coords.longitude,
        }
        const region = {
            ...location,
            ...normalDelta,
        }
        this.currentLocation = location
        if (this.animateToUserLocation) {
            this.region = region
            this.animateToUserLocation = false
        }
    }

    trackLocation = () => {
        /* Improve with a fresh rough estimate */
        navigator.geolocation.getCurrentPosition(
            this.updateLocation,
            /* Note: you need to provide an error callback, or it will throw
                     an exception on errors.
                     Just do nothing to swallow errors, such as

                        'Location request timed out'

               TODO: Show notification to user that location couldn't be obtained
            */
            (error) => null, //_.logError(error),
        )

        // update every 10s
        setTimeout(this.trackLocation, 10000)

        // /* Keep tracking with higher accuracy */
        // this.watchID = navigator.geolocation.watchPosition(
        //     this.updateLocation,
        //     (error) => _.logError(error.message),
        //     // {enableHighAccuracy: true}, //, timeout: 20000, maximumAge: 1000},
        // )
    }



    /*********************************************************************/
    /* Nearby Search                                                     */
    /*********************************************************************/

    /* Decide whether we allow the different page results downloaded from
       google maps to be mixed.

       This should be set to 'true' whenever we load more data from the
       map view, or when we switch to the bar list from the map page.

       This should be 'false' whenever the user hits the 'more' button at
       the bottom of the bar list page.
    */
    @action allowBarListReordering = (allow) => {
        this.canReorderBarList = allow
    }

    /* Load more bar info from google maps.

       This should be called only iff canLoadMoreData istrue
    */
    loadMoreData = async (barType = 'bar') => {
        transaction(() => {
            this.moreButtonEnabled = false
            this.moreButtonLoading = true
        })
        await this._loadMoreData(barType)
        this.enableMoreButton()
        this.moreButtonLoading = false
    }

    @action _loadMoreData = async (barType = 'bar') => {
        if (getNextPageToken(this.searchResponse1)) {
            this.searchResponse2 = await this.searchNearby(barType, getNextPageToken(this.searchResponse1))
        } else if (getNextPageToken(this.searchResponse)) {
            this.searchResponse1 = await this.searchNearby(barType, getNextPageToken(this.searchResponse))
        }
    }

    /* Decide whether the user can press the 'load more data' button */
    @computed get canLoadMoreData() {
        return this.searchResponse2.state !== 'Finished'
    }

    /* Decide whether the "load more data" button should be enabled */
    enableMoreButton = (after = 12000) => {
        setTimeout(() => {
            this.moreButtonEnabled = true
        }, after)
    }

    searchNearby = async (barType = 'bar', pagetoken = undefined, force = false) : Promise<DownloadResult<SearchResponse>> => {
        return await searchNearbyFirstPage( // searchNearbyFirstPage(
            config.mapsAPIKey,
            initialLocation,    // this.currentLocation,
            this.searchRadius,
            barType,
            true,
            pagetoken,
            force,
        )
    }

    getNearbyBarsDownloadResult = () : DownloadResult<SearchResponse> => {
        return this.searchResponse
    }

    @action updateNearbyBars = async (force = false) : void => {
        // this.searchResponse.downloadStarted()
        this.searchResponse = await this.searchNearby(
            'bar', pagetoken = undefined, force = force)
        // log("GOT SEARCH RESPONSE", this.searchResponse)
        this.enableMoreButton()
    }

    /* Initial batch of downloaded bars */
    @computed get batch0() : Array<Bar> {
        return getSearchResults(this.searchResponse)
    }

    /* Second batch of downloaded bars */
    @computed get batch1() : Array<Bar> {
        return getSearchResults(this.searchResponse1)
    }

    /* Final batch of downloaded bars */
    @computed get batch2() : Array<Bar> {
        return getSearchResults(this.searchResponse2)
    }

    /* Compute the list of nearby bars.

    We retrieve bar info from google maps in batches, and we do not want the
    bar list to be reordered as the user has scrolled midway in. So we only
    only allow re-ordering when we were re-ordering anyway (i.e. when the
    user has selected a new bar).
    */
    @computed get nearbyBarList() : Array<Bar> {
        if (this.canReorderBarList) {
            const entireBatch = [...this.batch0, ...this.batch1, ...this.batch2]
            return this.sortResults(entireBatch)
        } else {
            const batch0 = this.sortResults(this.batch0)
            const batch1 = this.sortResults(this.batch1)
            const batch2 = this.sortResults(this.batch2)
            return [...batch0, ...batch1, ...batch2]
        }
    }

    /*********************************************************************/
    /* Region and Map Marker                                             */
    /*********************************************************************/

    /* User changed region, stop following user location */
    @action userChangedRegion = (region) => {
        this.region = region
    }

    /* Determine what to focus on: a bar or the current location */
    @computed get focusPoint() {
        if (this.currentMarker && this.currentMarker.address) {
            // log("BAR FOCUS POINT", this.lastSelectedMarker.name)
            // return getBarCoords(this.lastSelectedMarker)
            return getBarCoords(this.currentMarker)
        }
        // log("CURRENT LOCATION FOCUS POINT")
        return this.currentLocation
    }

    getCurrentMarker = () : ?Coords => {
        return this.currentMarker
    }

    /* Select or de-select a marker */
    @action setCurrentMarker = (bar : Bar, track = false) => {
        this.currentMarker = bar
        if (track) {
            analytics.trackCurrentBar('Select Marker')
        }
    }

    /* Focus the given bar on the map */
    @action focusBar = (bar : Bar, switchToDiscoverPage = true, track = false) => {
        if (this.mapView != null) {
            const coords = getBarCoords(bar)
            const region = { ...coords, ...focusDelta }
            this.mapView.animateToRegion(region, 500)
        }
        if (switchToDiscoverPage)
            store.switchToDiscoverPage(true)
        if (track) {
            analytics.trackCurrentBar('Focus Bar on Map')
        }
        this.setCurrentMarker(bar, track = false)
    }

    /* All markers to be shown on the map.

    We do not reuse nearbyBarList here, as the bar list is re-arranged when
    selecting markers or moving location, which does not require updating the
    markers on the map!
    */
    @computed get allMarkers() : Array<Bar> {
        return [...this.batch0, ...this.batch1, ...this.batch2]
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

const getNextPageToken = (downloadResult) => {
    return downloadResult.value && downloadResult.value.nextPageToken
}

const getSearchResults = (searchResponse) => {
    if (searchResponse.value == null)
        return []
    return searchResponse.value.results
}
