import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'
import _ from 'lodash'

import { DownloadResult, emptyResult, downloadManager } from '../HTTP.js'
import { logErrors, log, flatten } from '../Curry.js'
import { store } from '../Store.js'
import { mapStore } from '../Maps/MapStore.js'

/************************* Types ***********************************/

import type { PlaceID } from '../Maps/MapStore.js'
import type { Bar, Menu } from './Bar.js'

/************************* Store ***********************************/

class BarStore {
    // DownloadResult[schema.Bar]
    @observable bar : DownloadResult<Bar> = emptyResult()
    @observable menuDownloadResult : DownloadResult<Menu> = emptyResult()

    // DownloadResult[ List[schema.Bar] ]
    @observable barList = emptyResult()

    @observable barAndMenuDownloadResult = DownloadResult.combine([
        this.bar,
        this.menuDownloadResult,
    ])

    // BarID
    @observable barID = null

    /*************************** State ***********************************/

    initialize = async () => {
        await this._setBarList()
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
    getBarListDownloadResult = () => this.barList
    getBar = () => this.bar.value

    /*************************** Network *********************************/

    _getBarMenu = async (placeID : PlaceID) : Promise<DownloadResult<Menu>> => {
        const fragments = `
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
        `

        const menuQuery = fragments + `
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
        isRelevant = () => placeID === this.barID
        const downloadResult = await downloadManager.graphQL(
            key, menuQuery, isRelevant)
        return downloadResult.update(data => data.menu)
    }


    _getBarInfo = async (placeID : PlaceID) => {
        return await mapStore.getPlaceInfo(placeID)
    }

    _setBarID = async (barID) => {
        if (this.bar.value && this.bar.value.id === barID)
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
            })
        }
    }

    _setBarList = async (location) => {
        const loc = location || store.location
        this.barList.downloadFinished([])
        // this.barList.downloadStarted()
        // const downloadResult = await this._getBarInfo("1")
        // this.barList = downloadResult.update((value) => [value])
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
        return flatten(menuItems)
    }

    /*********************************************************************/
    /* Functions that can be invoked async without catching errors */

    refreshBar = logErrors(async () => {
        if (this.barID)
            await this._setBarID(this.barID)
    })

    getBarMenu = logErrors(this._getBarMenu)
    getBarInfo = logErrors(this._getBarInfo)
    setBarID = logErrors(this._setBarID)
    setBarList = logErrors(this._setBarList)

    /*********************************************************************/

}

export const barStore = new BarStore()
