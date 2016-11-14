// @flow

import { computed, action } from 'mobx'
import { JSONDownload } from '/network/http.js'
import { buildURL } from '/utils/utils.js'
import { parseBar } from './place-info.js'
import { config } from '/utils/config.js'
import * as _ from '/utils/curry.js'

import type { Int, Float, URL, HTML } from '/utils/types.js'
import type { Key, Coords } from '/model/mapstore.js'
import type { Bar, BarType, Photo, TagID } from '/model/barstore.js'

const { log, assert } = _.utils('./network/api/maps/nearby.js')

export type SearchResponse = {
    htmlAttrib:     Array<string>,
    nextPageToken:  String,
    results:        Array<Bar>,
}

type LocationType =
    | 'bar'
    // | 'night_club'

export class SearchNearbyDownload extends JSONDownload {
    /* poperties:
        active: Bool
        coords: Coords
        radius: Int
            radius in meters
        pagetoken: ?String
        locationType: LocationType
        includeOpenNowOnly: Bool
    */

    // Name should be passed as 'attrib' to the constructor!
    // name = 'map nearby search'

    cacheInfo = config.nearbyCacheInfo

    @computed get active() {
        return this.props.active
    }

    @computed get cacheKey() {
        const { coords, radius, locationType, pagetoken } = this.props
        return `qd:maps:search:lat=${coords.latitude},lon=${coords.longitude},radius=${radius},locationType=${locationType},pagetoken=${pagetoken}`
    }

    @computed get url() {
        let params
        const { pagetoken, coords, radius, locationType, includeOpenNowOnly } = this.props
        if (this.props.pagetoken) {
            params = {
                key:        config.mapsAPIKey,
                pagetoken:  pagetoken,
            }
        } else {
            params = {
                key:        config.mapsAPIKey,
                // rankby: 'distance',
                radius:     radius,
                location:   `${coords.latitude},${coords.longitude}`,
                type:       locationType,
            }
            if (includeOpenNowOnly)
                params.opennow = true
        }
        return buildURL(
            "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
            params,
        )
    }

    finish() {
        super.finish()
        if (this.value && this.value.status !== 'OK') {
            var msg = `Error downloading data from google maps (${doc.status})`
            if (this.value.error_message)
                msg += `: ${doc.error_message}`
            this.downloadError(msg)
        } else if (this.value) {
            this.downloadFinished(parseResponse(this.value))
        }
    }

    @computed get searchResponse() : ?SearchResponse {
        return this.value
    }
}

/* See https://developers.google.com/places/web-service/search for the response structure */
const parseResponse = (doc) : SearchResponse => {
    return {
        'htmlAttrib':       doc.html_attribution,
        'nextPageToken':    doc.next_page_token,
        'results':          doc.results.map(parseBar),
    }
}
