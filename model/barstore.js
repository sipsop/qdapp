import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager } from '../network/http.js'
import * as _ from '../curry.js'
import { store } from './store.js'
import { mapStore } from '../mapstore.js'
import { tagStore } from '../tagstore.js'
import { segment } from '../network/analytics/segment.js'
import { analytics } from '../network/analytics/analytics.js'
import { config } from '../config.js'

/************************* Types ***********************************/

import type { PlaceID } from '../Maps/MapStore.js'
import type { Bar, Menu, MenuItem, BarID, MenuItemID } from './Bar.js'

/************************* Store ***********************************/

const { log, assert } = _.utils('./Bar/BarStore.js')

class BarStore {
    // BarID
    @observable barID = null

    @observable today : Int

    /* ScrollView component on the bar page */
    barScrollView = null

    /*************************** State ***********************************/

    getState = () => {
        return { barID: this.barID }
    }

    emptyState = () => {
        return { barID: null }
    }

    @action setState = async ({barID}) => {
        await this._setBarID(barID, track = false, focusOnMap = false)
    }

    /*************************** Getters *********************************/

    getBarDownloadResult = () => downloadManager.getDownload('barInfo')
    getMenuDownloadResult = () => downloadManager.getDownload('menu')
    getBar = () => this.getBarDownloadResult().lastValue

    /*************************** Network *********************************/

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

segment.trackCurrentBar = (event, properties) => {
    segment.track(event, {...segment.barProps(barStore.getBar()), ...properties})
}

segment.barProps = (bar : ?Bar) => {
    if (!bar)
        return null
    return {
        placeID:    bar.id,
        placeName:  bar.name,
    }
}

/************************** END HACKERY *********************/

export const getBarOpenTime = (bar : Bar) : ?OpeningTime => {
    if (!bar.openingTimes)
        return null
    return bar.openingTimes[barStore.today]
}

/* Get the day for which we should be displaying the time */
const getDay = () => {
    const date = new Date()
    var day = date.getDay()

    /* If it's before 06.00AM, display the date from the day before */
    if (date.getHours() < 6)
        day -= 1
    if (day < 0)
        day += 7
    return day
}

/* Update the 'day' every 5 minutes */
const setDay = () => {
    barStore.today = getDay()
    setTimeout(setDay, 1000 * 60 * 5)
}

export const barStore = new BarStore()
setDay()
