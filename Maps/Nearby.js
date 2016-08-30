// @flow

import { downloadManager } from '../HTTP.js'
import { buildURL } from '../URLs.js'

import type { Photo, SearchResult, SearchResults } from './MapTypes.js'

const BaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

const noResults = {
    htmlAttrib: [],
    nextToken:  null,
    results:    [],
}

export const searchNearby = async (apiKey, lat, lon, radius = 5000, type='bar') => {
    const url = buildURL(BaseURL, {
        key: apiKey,
        // rankby: 'distance',
        radius: radius,
        location: `${lat},${lon}`,
        type: 'bar',
    })
    const jsonDownloadResult = await downloadManager.fetchJSON(url)
    return jsonDownloadResult.update(parseResponse)
}

export const fetchMore = async (apiKey, prevResponse) => {
    if (!prevResponse.next_page_token)
        return noResults

    const url = buildURL(BaseURL, {
        key: apiKey,
        next_page_token: prevResponse.next_page_token,
    })
}

/* See https://developers.google.com/places/web-service/search for the response structure */
const parseResponse = (doc) : SearchResults => {
    return {
        'htmlAttrib': doc.html_attribution,
        'nextToken':  doc.next_page_token,
        'results': doc.results.map(parseSearchResult),
    }
}

const parseSearchResult = (result) : SearchResult => {
    return {
        placeID:    result.place_id,
        lat:        result.geometry.location.lat,
        lon:        result.geometry.location.lon,
        photos:     result.photos.map(parsePhoto),
        priceLevel: result.price_level,
        rating:     result.rating,
        types:      result.types,
    }
}

const parsePhoto = (photoRef) : Photo => {
    return {
        htmlAttrib: photoRef.html_attributions,
        photoID:    photoRef.photo_reference,
    }
}
