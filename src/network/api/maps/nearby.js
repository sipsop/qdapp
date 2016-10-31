// @flow

import { DownloadResult, emptyResult, downloadManager } from '/network/http.js'
import { buildURL } from '/utils/urls.js'
import { parseBar } from './place-info.js'
import { getCacheInfo } from '/network/cache.js'
import { config } from '/utils/config.js'
import * as _ from '/utils/curry.js'

import type { Int, Float } from '/utils/types.js'
import type { Key, Coords, PlaceID } from '/model/mapstore.js'
import type { Bar, Photo } from '/model/barstore.js'

const { log, assert } = _.utils('./Maps/Nearby.js')

/* TODO: Use declarative downloads */

/*********************************************************************/

export type SearchResponse = {
    htmlAttrib:     Array<string>,
    nextPageToken:  String,
    results:        Array<Bar>,
}

// export type MarkerInfo = {
//     coords:     Coords,
//     placeID:    PlaceID,
// }

/*********************************************************************/


const BaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

const noResults = {
    htmlAttrib:     [],
    nextPageToken:  null,
    results:        [],
}

const searchNearby = async (
        apiKey       : Key,
        coords       : Coords,
        radius       : Int,
        locationType : string,
        includeOpenNowOnly = true,
        pagetoken    = undefined,
        force        = false
        ) : Promise<DownloadResult<SearchResponse>> => {

    let params
    if (pagetoken) {
        params = {
            key:        apiKey,
            pagetoken:  pagetoken,
        }
    } else {
        params = {
            key:        apiKey,
            // rankby: 'distance',
            radius:     radius,
            location:   `${coords.latitude},${coords.longitude}`,
            type:       locationType,
        }
        if (includeOpenNowOnly)
            params.opennow = true
    }

    const url = buildURL(BaseURL, params)
    const key = `qd:maps:search:lat=${coords.latitude},lon=${coords.longitude},radius=${radius},locationType=${locationType},pagetoken=${pagetoken}`
    const options = { method: 'GET' }
    // log("FETCHING ", url)
    const jsonDownloadResult = await downloadManager.fetchJSON(
        key, url, options, getCacheInfo(config.nearbyCacheInfo, force))
    if (!jsonDownloadResult.value)
        return jsonDownloadResult

    const doc = jsonDownloadResult.value
    if (doc.status !== 'OK') {
        jsonDownloadResult.downloadError(
            `Error downloading data from google maps (${doc.status}): ${doc.error_message}`,
            refresh = null, /* TODO: */
        )
    }
    return jsonDownloadResult
}

export const searchNearbyFirstPage = async (
        apiKey       : Key,
        coords       : Coords,
        radius       : Int,
        locationType : string,
        includeOpenNowOnly = true,
        pagetoken    = undefined,
        force        = false,
        ) => {
    const jsonDownloadResult = await searchNearby(
        apiKey, coords, radius, locationType, includeOpenNowOnly, pagetoken, force)
    return jsonDownloadResult.update(parseResponse)
}

/* Note: This will not work, as you "need to wait a bit" between successive requests */
export const searchNearbyAllPages = async (
        apiKey       : Key,
        coords       : Coords,
        radius       : Int,
        locationType : string,
        includeOpenNowOnly = true,
        ) : Promise<DownloadResult<SearchResponse>> => {

    let htmlAttrib = []
    let results = []
    let pagetoken = undefined

    for (let i = 0; i < 3; i++) {
        const jsonDownloadResult = await searchNearby(
            apiKey,
            coords,
            radius,
            locationType,
            includeOpenNowOnly,
            pagetoken,
        )
        if (!jsonDownloadResult.value)
            return jsonDownloadResult

        const doc = jsonDownloadResult.value
        if (doc.html_attribution)
            htmlAttrib = [...htmlAttrib, ...doc.html_attribution]
        if (doc.results)
            results = [...results, ...doc.results]

        pagetoken = doc.next_page_token
        if (!pagetoken)
            break

        // log("GOT NEXT PAGE TOKEN =", pagetoken)
        // await _.sleep(15000)
    }

    return emptyResult().downloadFinished({
        htmlAttrib: htmlAttrib,
        results:    results.map(parseBar),
    })
}

export const fetchMore = async (
        apiKey : Key, prevResponse : SearchResponse
    ) : Promise<DownloadResult<SearchResponse>> => {
    if (!prevResponse.next_page_token)
        return noResults

    const url = buildURL(BaseURL, {
        key: apiKey,
        next_page_token: prevResponse.next_page_token,
    })
}

/* See https://developers.google.com/places/web-service/search for the response structure */
const parseResponse = (doc) : SearchResponse => {
    return {
        'htmlAttrib':       doc.html_attribution,
        'nextPageToken':    doc.next_page_token,
        'results':          doc.results.map(parseBar),
    }
}