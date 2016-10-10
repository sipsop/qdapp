// @flow

import type { Int, Float, String, URL, HTML } from '../Types.js'

export type ID = String
export type BarID = ID
export type MenuItemID = ID
export type TagID = ID

export type BarType = 'Pub' | 'Club'

export type Bar = {
    id:             String,
    // signedUp:       boolean,
    name:           String,
    photos:         Array<Photo>,
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
    // whether the bar is open now -- use with care (check the timestamp)
    openNow:        ?boolean,
}

export type Photo = {
    htmlAttrib: ?[String],
    url:        URL,
}

export type OpeningTime = {
    open:   ?Time,
    close:  ?Time,
}

export type DateType = {
    year:   Int,
    month:  Int,
    day:    Int,
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

/************************* Menu ***********************************/

export type Menu = {
    beer:       SubMenu,
    wine:       SubMenu,
    spirits:    SubMenu,
    cocktails:  SubMenu,
    water:      SubMenu,
}

export type SubMenu = {
    image:      URL,
    menuItems:  Array<MenuItem>,
}

export type MenuItem = {
    id:         String,
    name:       String,
    images:     Array<String>,
    tags:       Array<TagID>,
    price:      Price,
    options:    Array<MenuItemOption>,
}

export type MenuItemOption = {
    name:           String,
    optionType:     OptionType,
    optionList:     Array<String>,
    prices:         Array<Price>,
    defaultOption:  Int,
}

export type OptionType =
    | 'Single'
    | 'AtMostOne'
    | 'ZeroOrMore'
    | 'OneOrMore'

export type Price = {
    currency:   Currency,
    option:     PriceOption,
    price:      Float,
}

export type Currency =
    | 'Sterling'
    | 'Euros'
    | 'Dollars'

export type PriceOption =
    | 'Absolute'
    | 'Relative'
