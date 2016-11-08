// @flow

import { observable, action, autorun, computed, asMap, transaction } from 'mobx'

import { store, barStore, segment } from './store'
import { DownloadResult, downloadManager } from '/network/http'
import { SearchNearbyDownload } from '/network/api/maps/nearby'
import { Second } from '/utils/time'
import * as _ from '/utils/curry'
import { analytics } from '/model/analytics'
import { config } from '/utils/config'

import type { Bar } from './barstore'
import type { SearchResponse } from '/network/api/maps/nearby'

const { log, assert } = _.utils("model/mapstore")

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
    @observable searchButtonVisible : Bool = false
    @observable currentLocation : Coords = initialLocation
    @observable region : Region = {
        ...initialLocation,
        ...normalDelta,
    }

    @observable currentMarker : ?Bar = null
    @observable currentLocation : Coords = initialLocation
    @observable lastSelectedMarker : ?Bar = null
    @observable canReorderBarList : Bool = false

    @observable moreButtonLoading : Bool = false
    @observable moreButtonEnabled : Bool = false
    /* Timer to enable the 'More' button on the discover page */
    enableMoreButtonTimer = null

    @observable search0Active = true
    @observable search1Active = false
    @observable search2Active = false
    /* Whether search1/search2 have started for this page token */
    @observable search1Started = false
    @observable search2Started = false

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

    initialized = async () => {
        // setTimeout(this.trackLocation, 2000)
        mapStore.trackLocation()
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

    @computed get searchLocation() : Coords {
        return {
            latitude: this.region.latitude,
            longitude: this.region.longitude,
        }
    }

    /* Search radius (in meters) */
    @computed get searchRadius() : Int {
        return Math.ceil(
            distance(
                this.region,
                { ...this.region
                , latitude: this.region.latitude + this.region.latitudeDelta
                }
            )
        )
    }

    initialize = () => {
        this.declareSearchDownload({
            isActive: () => this.search0Active,
            getPageToken: () => null,
            attrib: {
                name: 'map search 0',
                onStart: () => {
                    this.search0Active = false
                    this.search1Started = false
                },
                onFinish: this.enableMoreButton,
            },
        })
        this.declareSearchDownload({
            isActive: () => this.search1Active,
            getPageToken: () => getNextPageToken(this.searchResponse0),
            attrib: {
                name: 'map search 1',
                onStart: () => {
                    this.search1Started = true
                    this.search1Active = false
                },
                onFinish: this.enableMoreButton,
            },
        })
        this.declareSearchDownload({
            isActive: () => this.search2Active,
            getPageToken: () => getNextPageToken(this.searchResponse1),
            attrib: {
                name: 'map search 2',
                onStart: () => {
                    this.search2Started = true
                    this.search2Active = false
                },
                onFinish: () => {
                    this.moreButtonLoading = false
                },
            },
        })
    }

    declareSearchDownload = ({isActive, getPageToken, attrib}) => {
        downloadManager.declareDownload(new SearchNearbyDownload(
            () => {
                return {
                    active: isActive(),
                    coords: this.searchLocation,
                    radius: this.searchRadius,
                    pagetoken: getPageToken(),
                    locationType: 'bar',
                    includeOpenNowOnly: true,
                }
            },
            attrib,
        ))
    }

    @computed get searchResponse0() {
        return downloadManager.getDownload('map search 0')
    }

    @computed get searchResponse1() {
        return downloadManager.getDownload('map search 1')
    }

    @computed get searchResponse2() {
        return downloadManager.getDownload('map search 2')
    }

    @action searchNearby = () => {
        this.search0Active = true
        this.search1Active = false
        this.search2Active = false
        this.search1Started = false
        this.search2Started = false
    }

    getNearbyBarsDownloadResult = () : DownloadResult<SearchResponse> => {
        return this.searchResponse0
    }

    /* Initial batch of downloaded bars */
    @computed get batch0() : Array<Bar> {
        return getSearchResults(this.searchResponse0)
    }

    /* Second batch of downloaded bars */
    @computed get batch1() : Array<Bar> {
        if (!this.search1Started)
            return []
        return getSearchResults(this.searchResponse1)
    }

    /* Final batch of downloaded bars */
    @computed get batch2() : Array<Bar> {
        if (!this.search2Started)
            return []
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
    /* More Button                                                       */
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
    @action loadMoreData = () => {
        this.disableMoreButton()
        if (this.search1Started) {
            this.search2Active = true
        } else {
            this.search1Active = true
        }
    }

    /* Decide whether the user can press the 'load more data' button */
    @computed get canLoadMoreData() {
        return !this.search2Started
    }

    disableMoreButton = () => {
        if (this.enableMoreButtonTimer)
            clearTimeout(this.enableMoreButtonTimer)
        this.enableMoreButtonTimer = null
        this.moreButtonEnabled = false
        this.moreButtonLoading = true
    }

    /* Decide whether the "load more data" button should be enabled */
    enableMoreButton = (after = 10000) => {
        this.moreButtonLoading = false
        this.enableMoreButtonTimer = setTimeout(() => {
            this.moreButtonEnabled = true
        }, after)
    }

    /*********************************************************************/
    /* Region and Map Marker                                             */
    /*********************************************************************/

    /* User changed region, stop following user location */
    @action userChangedRegion = (region) => {
        this.region = region
        this.searchButtonVisible = true
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
    focusBar = (bar : Bar, switchToDiscoverPage = true, track = false) => {
        if (switchToDiscoverPage)
            store.switchToDiscoverPage(scrollToTop = true)
        /* NOTE: this needs to be async to
            a) seem snappy, and
            b) properly scroll to top
        */
        setTimeout(() => this._focusBar(bar, track), 0)
    }

    @action _focusBar = (bar, track = false) => {
        if (this.mapView != null) {
            const coords = getBarCoords(bar)
            const region = { ...coords, ...focusDelta }
            this.mapView.animateToRegion(region, 500)
        }
        this.setCurrentMarker(bar, track = false)
        if (track)
            analytics.trackCurrentBar('Focus Bar on Map')
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
