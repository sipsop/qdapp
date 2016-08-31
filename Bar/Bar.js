// @flow

import type { Int, Float, String, URL, HTML } from '../Types.js'

export type TagID = String

export type Bar = {
    id:             String,
    signedUp:       boolean,
    name:           String,
    images:         Array<Photo>,
    address:        Address,
    // optional fields
    desc:           ?String,
    htmlAttrib:     ?[HTML],
    rating:         ?Float,
    priceLevel:     ?Int,
    tags:           ?Array<TagID>,
    phone:          ?String,
    website:        ?String,
    openingTimes:   ?Array<?OpeningTime>,
}

export type Photo = {
    htmlAttrib: ?[String],
    url:        URL,
}

export type OpeningTime = {
    open:   ?Time,
    close:  ?Time,
}

export type Time = {
    hour:   Int,
    minute: Int,
}

export type Address = {
    lat:                Float,
    lon:                Float,
    formattedAddress:   ?String,
    // city:   String,
    // street: String,
    // number: String,
    // postcode: String,
}
