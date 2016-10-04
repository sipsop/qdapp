// @flow

import { DownloadResult, downloadManager } from '../HTTP.js'
import { buildURL } from '../URLs.js'
import { parsePhoto } from './Photos.js'
import * as _ from '../Curry.js'

import type { Int, Float, URL, HTML } from '../Types.js'
import type { Key, Coords } from './MapStore.js'
import type { Bar, BarType, Photo, TagID } from '../Bar/Bar.js'

const { log, assert } = _.utils('./Maps/PlaceInfo.js')

/************************* Network ***********************************/

const BaseURL = "https://maps.googleapis.com/maps/api/place/details/json"

export const getPlaceInfo = async (apiKey : Key, placeID : String)
        : Promise<DownloadResult<Bar>> =>
        {
    const url = buildURL(BaseURL, {
        key: apiKey,
        placeid: placeID,
    })
    const key = `qd:placeInfo:placeID=${placeID}`
    const jsonDownloadResult = await downloadManager.fetchJSON(
        key, url, {method: 'GET'})
    if (jsonDownloadResult.value && jsonDownloadResult.value.status !== 'OK')
        throw Error(jsonDownloadResult.value.status)
    const result = jsonDownloadResult.update(doc => parseBar(doc.result, doc.html_attributions))
    return result
}

/************************* Response Parsing **************************/

export const parseBar = (result : any, htmlAttrib : ?Array<HTML> = null) : Bar => {
    return {
        id:             result.place_id,
        signedUp:       false, // this info must be fetched separate from our server
        name:           result.name,
        photos:         result.photos ? result.photos.map(parsePhoto) : [],
        address:        parseAddress(result),
        barType:        getBarType(result.types),

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
        openNow:        parseOpenNow(result),
    }
}

const getBarType = (types : ?Array<String>) : BarType => {
    if (types == null)
        return 'Pub'
    return _.includes(types, 'bar') ? 'Pub' : 'Club'
}

const parseTags = (tagList : Array<String>) : ?Array<TagID> => {
    if (!tagList)
        return null
    return [] // TODO: implement
}

const parseOpeningTimes = (doc) => {
    if (!doc.opening_hours || !doc.opening_hours.periods)
        return null
    const result = [null, null, null, null, null, null, null]
    doc.opening_hours.periods.forEach((period, i) => {
        const day = (
            (period.open && period.open.day) ||
            (period.close && period.close.day)
        )
        result[day] = {
            open:  period.open ? parseTime(period.open) : null,
            close: period.close ? parseTime(period.close) : null,
        }
    })
    return result
}

const parseOpenNow = (doc) => {
    if (!doc.opening_hours)
        return null
    return doc.opening_hours.open_now
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
