import { observable, transaction, computed, action, asMap } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'

import { DownloadResult, emptyResult, downloadManager } from '../HTTP.js'
import * as _ from '../Curry.js'
import { store } from '../Store.js'
import { mapStore } from '../Maps/MapStore.js'
import { barStatusStore } from './BarStatus.js'
import { tagStore } from '../Tags.js'
import { segment } from '../Segment.js'
import { config } from '../Config.js'
import { getMenuQuery } from './MenuQuery.js'

/************************* Types ***********************************/

import type { PlaceID } from '../Maps/MapStore.js'
import type { Bar, Menu, MenuItem, BarID, MenuItemID } from './Bar.js'

/************************* Store ***********************************/

const { log, assert } = _.utils('./Bar/BarStore.js')

class BarStore {
    // DownloadResult[schema.Bar]
    @observable bar : DownloadResult<Bar> = emptyResult()
    @observable menuDownloadResult : DownloadResult<Menu> = emptyResult()

    @observable barAndMenuDownloadResult = DownloadResult.combine([
        this.bar,
        this.menuDownloadResult,
    ])

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

    getBarDownloadResult = () => this.bar
    getMenuDownloadResult = () => this.menuDownloadResult
    getBarAndMenuDownloadResult = () => this.barAndMenuDownloadResult
    getBar = () => this.bar.value

    /*************************** Network *********************************/

    _getBarMenu = async (barID : PlaceID, force = false) : Promise<DownloadResult<Menu>> => {
        const cacheInfo = force ? config.defaultRefreshCacheInfo : undefined
        const downloadResult = await downloadManager.query(
            `qd:bar:barID=${barID}`,
            getMenuQuery(barID),
            cacheInfo
        )
        return downloadResult

        /* Normalize the data, by setting 'menuItem.options' for each 'menuItem.optionID' */
        // return downloadResult.update(data => {
            // const menu = data.menu
            // const allOptions = {}
            // menu.allMenuItemOptions.forEach(menuItemOption => {
            //     allOptions[menuItemOption.id] = menuItemOption
            // })
            // Object.values(menu).forEach(menuItems => {
            //     menuItems.forEach(menuItem => {
            //         menuItem.options = {
            //             ...allOptions[menuItem.optionsID],
            //             ...menuItem.options,
            //         }
            //     })
            // })
        //     return menu
        // })
    }

    _getBarInfo = async (placeID : PlaceID, force = false) => {
        return await mapStore.getPlaceInfo(placeID, force = force)
    }

    trackSelectBar = (barID) => {
        segment.track('Select Bar', {
            placeID:    this.barID,
            placeName:  this.barName,
        })
    }

    _setBarID = async (barID, track = false, focusOnMap = true) => {
        log("Setting barID", barID)
        const bar = this.getBar()
        if (bar && bar.id === barID && this.menu) {
            if (track) this.trackSelectBar(barID)
            return /* All done */
        }

        if (!barID) {
            /* Clear the download results */
            transaction(() => {
                this.barID = barID
                this.bar.reset()
                this.menuDownloadResult.reset()
            })
            return
        }

        transaction(() => {
            this.barID = barID
            this.bar.downloadStarted()
            this.menuDownloadResult.downloadStarted()
        })
        await this.updateBarAndMenu(barID)
        if (track)
            this.trackSelectBar(barID)
        if (focusOnMap && this.getBar() != null) {
            setTimeout(() => {
                mapStore.focusBar(this.getBar(), switchToDiscoverPage=false)
            }, 1000)
        }
        await Promise.all([
            tagStore.fetchTags(),
            barStatusStore.downloadBarStatus(this.barID),
        ])
    }

    @action updateBarAndMenu = async (barID, force = false) => {
        await Promise.all([
            this.updateBarInfo(barID, force = force),
            /* TODO: Group queries (bar status + menu + tags) */
            this.updateMenuInfo(barID, force = force),
        ])
    }

    @action updateBarInfo = async (barID, force = false) => {
        const barDownloadResult = await this._getBarInfo(barID, force = force)
        /* NOTE: a user may have selected a different bar
                 before this download has completed, in
                 which case we should ignore the download.
        */
        if (barID === this.barID) {
            this.setBarDownloadResult(barDownloadResult)
        }
    }

    @action updateMenuInfo = async (barID, force = false) => {
        const menuDownloadResult = await this._getBarMenu(barID, force = force)
        if (barID === this.barID) {
            this.setMenuDownloadResult(menuDownloadResult)
        }
    }

    @action setBarDownloadResult = (downloadResult) => {
        if (!downloadResult)
            throw Error("DownloadResult is undefined in setBarDownloadResult!")
        this.bar.from(downloadResult)
    }

    @action setMenuDownloadResult = (downloadResult) => {
        this.menuDownloadResult.from(downloadResult)
    }

    @computed get menu() {
        return this.menuDownloadResult.value
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
        // menuItems.forEach(xs => {
        //     if (!Array.isArray(xs))
        //         throw Error("Expected an array of menu items: " + xs)
        //     xs.forEach(menuItem => {
        //         if (!menuItem.id)
        //             throw Error("Menu item must have an ID")
        //     })
        // })
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

    refreshBar = _.logErrors(async () => {
        if (this.barID) {
            segment.track('Refresh Bar', {
                placeID:    this.barID,
                placeName:  this.barName,
            })
            await this._setBarID(this.barID)
        }
    })

    getBarMenu = _.logErrors(this._getBarMenu)
    getBarInfo = _.logErrors(this._getBarInfo)

    setBarID = _.logErrors(async (barID, track = false, focusOnMap = true) => {
        await this._setBarID(barID, track, focusOnMap)
    })

    /*********************************************************************/

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
