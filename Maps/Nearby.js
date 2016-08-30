// @flow

import { DownloadResult, downloadManager } from '../HTTP.js'
import { buildURL } from '../URLs.js'

import type { Int, Float } from '../Types.js'
import type { Key, Coords } from './MapStore.js'
import type { Photo, parsePhoto } from './Photos.js'

/*********************************************************************/

export type SearchResult = {
    placeID:    string,
    name:       string,
    lat:        Float,
    lon:        Float,
    photos:     Array<Photo>,
    priceLevel: Int,            // 1 through 4 (4 being "very exprensive" and 1 being "free")
    rating:     Float,          // e.g. 3.4
    types:      Array<string>,  // e.g. ['cafe', 'food', 'restaurant']
}

export type SearchResponse = {
    htmlAttrib: Array<string>,
    nextToken:  string,
    results:    SearchResult,
}

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
    const jsonDownloadResult = await downloadManager.fetchJSON(url)
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
        'htmlAttrib': doc.html_attribution,
        'nextToken':  doc.next_page_token,
        'results': doc.results.map(parseSearchResult),
    }
}

const parseSearchResult = (result) : SearchResult => {
    return {
        placeID:    result.place_id,
        name:       result.name,
        lat:        result.geometry.location.lat,
        lon:        result.geometry.location.lon,
        photos:     result.photos.map(parsePhoto),
        priceLevel: result.price_level,
        rating:     result.rating,
        types:      result.types,
    }
}
