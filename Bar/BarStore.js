import { observable, transaction, computed, action, asMap } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'

import { DownloadResult, emptyResult, downloadManager } from '../HTTP.js'
import * as _ from '../Curry.js'
import { store } from '../Store.js'
import { mapStore } from '../Maps/MapStore.js'

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

    /*************************** State ***********************************/

    initialize = async () => {

    }

    getState = () => {
        return { barID: this.barID }
    }

    @action setState = async ({barID}) => {
        if (barID)
            await this._setBarID(barID)
    }

    /*************************** Getters *********************************/

    getBarDownloadResult = () => this.bar
    getBarAndMenuDownloadResult = () => this.barAndMenuDownloadResult
    getBar = () => this.bar.value

    /*************************** Network *********************************/

    _getBarMenu = async (placeID : PlaceID) : Promise<DownloadResult<Menu>> => {
        const menuQuery = `
            fragment PriceFragment on Price {
                currency
                option
                price
            }

            fragment SubMenuFragment on SubMenu {
                image
                menuItems {
                    id
                    name
                    desc
                    images
                    tags
                    price {
                        ...PriceFragment
                    }
                    options {
                        name
                        optionType
                        optionList
                        prices {
                            ...PriceFragment
                        }
                        defaultOption
                    }
                }
            }

            query {
                menu(placeID : "${placeID}") {
                    beer {
                        ...SubMenuFragment
                    }
                    wine {
                        ...SubMenuFragment
                    }
                    spirits {
                        ...SubMenuFragment
                    }
                    cocktails {
                        ...SubMenuFragment
                    }
                    water {
                        ...SubMenuFragment
                    }
                }
            }
        `

        key = `qd:placeID=${placeID}`
        const downloadResult = await downloadManager.graphQL(key, menuQuery)
        return downloadResult.update(data => data.menu)
    }


    _getBarInfo = async (placeID : PlaceID) => {
        return await mapStore.getPlaceInfo(placeID)
    }

    _setBarID = async (barID) => {
        const bar = this.getBar()
        if (bar && bar.id === barID && this.menu)
            return /* All done */

        console.log("Setting bar with placeID =", barID)

        transaction(() => {
            this.barID = barID
            this.bar.downloadStarted()
            this.menuDownloadResult.downloadStarted()
        })

        const [barDownloadResult, menuDownloadResult] = await Promise.all(
            [ this._getBarInfo(barID), this._getBarMenu(barID) ])
        if (this.barID === barID) {
            /* NOTE: a user may have selected a different bar
                     before this download has completed, in
                     which case we should ignore the download.
            */
            transaction(() => {
                this.setBarDownloadResult(barDownloadResult)
                this.setMenuDownloadResult(menuDownloadResult)
                if (this.getBar() != null) {
                    setTimeout(() => {
                        mapStore.focusBar(this.getBar(), switchToDiscoverPage=false)
                    }, 1000)
                }
            })
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
            // , menu.snacks
            // , menu.food
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
        log('menuItems:', menuItems)
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

    /* Get the string options for menu item, e.g. [['pint'], ['lime']] */
    getMenuItemStringOptions = (menuItem, selectedOptions : Array<Array<Int>>) : Array<Array<String>> => {
        return _.zipWith(menuItem.options, selectedOptions,
            (menuItemOption, selection) => {
                return selection.map(i => menuItemOption.optionList[i])
            }
        )
    }

    /* Get the string options for menu item, e.g. [[0], [2]] */
    getOrderItemIntOptions = (menuItem, selectedStringOptions : Array<Array<String>>) : Array<Array<Int>> => {
        return _.zipWith(menuItem.options, selectedOptions,
            (menuItemOption, selection) => {
                return selection.map(s => _.find(menuItemOption.optionList, s))
            }
        )
    }

    /*********************************************************************/
    /* Functions that can be invoked async without catching errors */

    refreshBar = _.logErrors(async () => {
        if (this.barID)
            await this._setBarID(this.barID)
    })

    getBarMenu = _.logErrors(this._getBarMenu)
    getBarInfo = _.logErrors(this._getBarInfo)
    setBarID = _.logErrors(this._setBarID)

    /*********************************************************************/

}

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
