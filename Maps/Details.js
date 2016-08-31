// @flow

import { DownloadResult, downloadManager } from '../HTTP.js'
import { buildURL } from '../URLs.js'
import { parsePhoto } from './Photos.js'

import type { Int, Float, URL, HTML } from '../Types.js'
import type { Key, Coords } from './MapStore.js'
import type { Bar, Photo, TagID } from '../Bar/Bar.js'

/************************* Network ***********************************/

const BaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

export const getPlaceInfo = async (apiKey : Key, placeID : String)
        : Promise<DownloadResult<Bar>> =>
        {
    const url = buildURL(BaseURL, {
        key: apiKey,
        placeid: placeID,
    })
    const jsonDownloadResult = await downloadManager.fetchJSON(url)
    return jsonDownloadResult.update(doc => parseBar(doc.result, doc.html_attributions))
}

/************************* Response Parsing **************************/

export const parseBar = (result : any, htmlAttrib : ?Array<HTML> = null) : Bar => {
    return {
        id:             result.place_id,
        signedUp:       false, // this info must be fetched separate from our server
        name:           result.name,
        images:         result.photos.map(parsePhoto),
        address:        parseAddress(result),

        // optional fields
        // TODO: include the 'review_summary' parameter in the URL
        // (does this require a premium subscription?)
        desc:           null, // result.review_summary,
        htmlAttrib:     htmlAttrib,
        rating:         result.rating,
        priceLevel:     result.price_level,
        tags:           parseTags(result.types),
        phone:          result.formatted_phone_number,
        website:        result.website,
        openingTimes:   parseOpeningTimes(result),
    }
}

const parseTags = (tagList : Array<String>) : ?Array<TagID> => {
    if (!tagList)
        return null
    return [] // TODO: implement
}

const parseOpeningTimes = (doc) => {
    if (!doc.opening_hours)
        return null
    const result = [null, null, null, null, null, null, null]
    doc.opening_hours.periods.forEach((period, i) => {
        result[period.open.day] = {
            open:  parseTime(period.open),
            close: parseTime(period.close),
        }
    })
    return result
}

const parseTime = (doc : { time : String}) => {
    // { time: '2000' }
    return {
        hour:   parseInt(doc.time.slice(0, 2)),
        minute: parseInt(doc.time.slice(2)),
    }
}

const parseAddress = (result) => {
    return {
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
    }
}
