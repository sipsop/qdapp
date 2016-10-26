import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager } from '../network/http.js'
import { BarInfoDownload } from '../network/api/maps/place-info.js'
import { MenuDownload } from '../network/api/menu.js'
import { analytics } from '../network/analytics/analytics.js'
import { config } from '../config.js'
import * as _ from '../curry.js'

import { store } from './store.js'
import { mapStore } from './mapstore.js'
import { tagStore } from './tagstore.js'
import { parseBar } from './maps/place-info.js'
import type { PlaceID } from './mapstore.js'

import type { Int, Float, String, URL, HTML } from '~/utils/types.js'

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


const { log, assert } = _.utils('./model/barstore.js')

class BarStore {
    // BarID
    @observable barID = null

    /* ScrollView component on the bar page */
    barScrollView = null

    /*********************************************************************/
    /* Initialization */
    /*********************************************************************/

    getState = () => {
        return { barID: this.barID }
    }

    emptyState = () => {
        return { barID: null }
    }

    @action setState = async ({barID}) => {
        await this._setBarID(barID, track = false, focusOnMap = false)
    }

    initialize = () => {
        downloadManager.declareDownload(new BarInfoDownload(this.getDownloadProps))
        downloadManager.declareDownload(new MenuDownload(this.getDownloadProps))
    }

    /*********************************************************************/
    /* Downloads */
    /*********************************************************************/

    getBarDownloadResult = () => downloadManager.getDownload('barInfo')
    getMenuDownloadResult = () => downloadManager.getDownload('menu')

    getBar = () => {
        const jsonResult = this.getBarDownloadResult().lastValue
        return parseBar(this.value.result, this.value.html_attributions)
    }

    getDownloadProps = () => {
        return {
            barID: this.barID,
        }
    }

    /*********************************************************************/
    /* Actions */
    /*********************************************************************/

    _setBarID = async (barID, track = false, focusOnMap = true) => {
        log("Setting barID", barID)
        this.barID = barID
        if (track)
            analytics.trackSelectBar(this.barID, this.barName)
        await this.getBarDownloadResult().wait()
        /* Update the selected marker on the map */
        if (focusOnMap && this.getBar() != null) {
            setTimeout(() => {
                mapStore.focusBar(this.getBar(), switchToDiscoverPage=false)
            }, 1000)
        }
    }

    @action updateBarAndMenu = async (barID, force = false) => {
        await Promise.all([
            this.updateBarInfo(barID, force = force),
            this.updateMenuInfo(barID, force = force),
        ])
    }

    @action updateBarInfo = async (barID, force = false) => {
        if (force)
            await downloadManager.forceRefresh('barInfo')
    }

    @action updateMenuInfo = async (barID, force = false) => {
        if (force)
            await downloadManager.forceRefresh('menu')
    }

    /***********************************************************************/
    /* Menu */

    @computed get menu() {
        return downloadManager.getDownload('menu').lastValue
    }

    @computed get allMenuItems() {
        const menu = this.menu
        if (!menu)
            return []

        const subMenus = (
            [ menu.beer
            , menu.wine
            , menu.spirits
            , menu.cocktails
            , menu.water
            , menu.snacks
            , menu.food
            ])
        const menuItems = subMenus.map(subMenu => subMenu.menuItems)
        return _.flatten(menuItems)
    }

    @computed get menuItemByID() {
        return asMap(this.allMenuItems.map(
            menuItem => [menuItem.id, menuItem]
        ))
    }

    @computed get openingTimes() {
        return this.getBar()
            ? this.getBar().openingTimes
            : null
    }

    @computed get barOpenTime() : ?OpeningTime {
        return this.getBar()
            ? getBarOpenTime(this.getBar())
            : null
    }

    @computed get barName() : String {
        return this.getBar()
            ? this.getBar().name
            : ""
    }

    getMenuItem = (menuItemID : MenuItemID) : MenuItem => {
        if (this.menuItemByID.has(menuItemID))
            return this.menuItemByID.get(menuItemID)
        return null
    }

    /*********************************************************************/
    /* Functions that can be invoked async without catching errors */

    setBarID = _.logErrors(async (barID, track = false, focusOnMap = true) => {
        await this._setBarID(barID, track, focusOnMap)
    })

}

/************************** MONEKY PATCH SEGMENT *********************/



/************************** END HACKERY *********************/

export const getBarOpenTime = (bar : Bar) : ?OpeningTime => {
    if (!bar.openingTimes)
        return null
    return bar.openingTimes[timeStore.today]
}

export const barStore = new BarStore()
