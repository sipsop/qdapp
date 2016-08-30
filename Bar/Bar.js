// @flow

import type { Int, Float, String, URL } from '../Types.js'

export type Bar = {
    id:             String,
    name:           String,
    desc:           ?String,
    images:         Array<Image>,
    tags:           Array<String>,
    phone:          ?String,
    website:        ?String,
    openingTimes:   Array<OpeningTime>,
    address:        Address,
}

export type Image = {
    htmlAttrib: ?[String],
    url:        URL,
}

export type OpeningTime = {
    day:    Int,
    open:   ?Time,
    close:  ?Time,
}

export type Time = {
    hour:   Int,
    minute: Int,
}

export type Address = {
    lat:    Float,
    lon:    Float,
    formattedAddress: String,
    city:   String,
    street: String,
    number: String,
    postcode: String,
}
