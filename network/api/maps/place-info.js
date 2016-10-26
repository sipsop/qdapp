// @flow

import { computed, action } from 'mobx'
import { config } from '~/utils/config.js'
import * as _ from '~/utils/curry.js'

import type { Int, Float, URL, HTML } from '~/utils/types.js'
import type { Key, Coords } from '~/model/mapstore.js'
import type { Bar, BarType, Photo, TagID } from '~/model/barstore.js'

const { log, assert } = _.utils('./network/api/maps/place-info.js')

export class BarInfoDownload extends JSONDownload {
    /* properties:
        barID: String
    */

    name = 'barInfo'

    @computed get active() {
        return this.props.barID != null
    }

    @computed get cacheKey() {
        return `qd:placeInfo:${this.props.barID}`
    }

    @computed get url() {
        return buildURL(
            "https://maps.googleapis.com/maps/api/place/details/json",
            { key: config.mapsAPIKey
            , placeid: this.props.barID
            }
        )
    }

    @action finish = () => {
        if (this.value && this.value.status !== 'OK') {
            this.downloadError(this.value.status)
        }
    }
}

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

const parsePhoto = (photoRef : any) : Photo => {
    return {
        htmlAttrib: photoRef.html_attributions,
        url:        getPhotoURL(photoRef.photo_reference),
    }
}

const getPhotoURL = (photoID : String) => {
    return buildURL("https://maps.googleapis.com/maps/api/place/photo", {
        key: config.mapsAPIKey,
        photoreference: photoID,
        maxheight: 500,
        maxwidth: 500,
    })
}
