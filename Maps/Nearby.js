// @flow

import { DownloadResult, downloadManager } from '../HTTP.js'
import { buildURL } from '../URLs.js'
import { parsePhoto } from './Photos.js'
import { parseBar } from './PlaceInfo.js'

import type { Int, Float } from '../Types.js'
import type { Key, Coords, PlaceID } from './MapStore.js'
import type { Bar, Photo } from '../Bar/Bar.js'

/*********************************************************************/

export type SearchResponse = {
    htmlAttrib: Array<string>,
    nextToken:  string,
    results:    Array<Bar>,
}

// export type MarkerInfo = {
//     coords:     Coords,
//     placeID:    PlaceID,
// }

/*********************************************************************/


const BaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

const noResults = {
    htmlAttrib: [],
    nextToken:  null,
    results:    [],
}

export const searchNearby = async (
        apiKey       : Key,
        coords       : Coords,
        radius       : Int,
        locationType : string,
        ) : Promise<DownloadResult<SearchResponse>> => {

    const url = buildURL(BaseURL, {
        key: apiKey,
        // rankby: 'distance',
        radius: radius,
        location: `${coords.latitude},${coords.longitude}`,
        type: locationType,
    })

    const key = `qd:maps:search:lat=${coords.latitude},lon=${coords.longitude}`
    const isRelevant = () => true
    const options = { method: 'GET' }
    const jsonDownloadResult = await downloadManager.fetchJSON(
        key, url, options, isRelevant)
    console.log("Downloaded some stuff from", url, "!!!", jsonDownloadResult.state, jsonDownloadResult.message, jsonDownloadResult.value)
    return jsonDownloadResult.update(parseResponse)
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
        'htmlAttrib':   doc.html_attribution,
        'nextToken':    doc.next_page_token,
        'results':      doc.results.map(parseBar),
    }
}
