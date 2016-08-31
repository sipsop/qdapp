import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'
import _ from 'lodash'

import { DownloadResult, emptyResult, downloadManager } from '../HTTP.js'
import { logErrors } from '../Curry.js'
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

    // BarID
    @observable barID = null

    getState = () => {
        return { barID: this.barID }
    }

    @action setState = async ({barID}) => {
        if (barID)
            await this._setBarID(barID)
    }

    initialize = async () => {
        await this._setBarList()
    }

    refreshBar = logErrors(async () => {
        if (this.barID)
            await this._setBarID(this.barID)
    })

    getBarDownloadResult = () => this.bar
    getBarAndMenuDownloadResult = () =>
        DownloadResult.combine({ bar: this.bar, menu: this.menuDownloadResult})
    getBarListDownloadResult = () => this.barList
    getBar = () => this.bar.value

    getBarMenu = async (placeID : PlaceID) : Promise<DownloadResult<Menu>> => {
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
        console.log("DOWNLOADED MENU!", downloadResult.value)
        return downloadResult.update(data => data.menu)
    }

    getBarInfo = logErrors(async (placeID : PlaceID) => {
        return await mapStore.getPlaceInfo(placeID)
    })

    // getBarInfo = async (barID, menu) => {
    //     const menuQuery = !menu ? '' : `
    //         menu {
    //             beer {
    //                 ...SubMenuFragment
    //             }
    //             wine {
    //                 ...SubMenuFragment
    //             }
    //             spirits {
    //                 ...SubMenuFragment
    //             }
    //             cocktails {
    //                 ...SubMenuFragment
    //             }
    //             water {
    //                 ...SubMenuFragment
    //             }
    //         }
    //     `
    //     const fragments = `
    //         fragment PriceFragment on Price {
    //             currency
    //             option
    //             price
    //         }
    //
    //         fragment SubMenuFragment on SubMenu {
    //             image
    //             menuItems {
    //                 id
    //                 name
    //                 desc
    //                 images
    //                 tags
    //                 price {
    //                     ...PriceFragment
    //                 }
    //                 options {
    //                     name
    //                     optionType
    //                     optionList
    //                     prices {
    //                         ...PriceFragment
    //                     }
    //                     defaultOption
    //                 }
    //             }
    //         }
    //     `
    //
    //     var query = `
    //         query {
    //             bar(id: "${barID}") {
    //                 id
    //                 name
    //                 desc
    //                 images
    //                 tags
    //                 phone
    //                 website
    //                 openingTimes {
    //                     day
    //                     openTime {
    //                         hour
    //                         minute
    //                     }
    //                     closeTime {
    //                         hour
    //                         minute
    //                     }
    //                 }
    //                 address {
    //                     lat
    //                     lon
    //                     city
    //                     street
    //                     number
    //                     postcode
    //                 }
    //                 ${menuQuery}
    //             }
    //         }
    //         `
    //
    //         key = `qd:bar=${barID}:menu=${menu}`
    //         if (menuQuery)
    //             query += fragments
    //
    //         isRelevant = () => barID === this.barID
    //         const downloadResult = await downloadManager.graphQL(
    //             key, query, isRelevant)
    //         return downloadResult.update((data) => data.bar)
    // }

    _setBarID = async (barID) => {
        if (this.bar.value && this.bar.value.id === barID)
            return /* All done */

        console.log("Setting bar with placeID =", barID)

        transaction(() => {
            this.setBarDownloadResult(emptyResult().downloadStarted())
            this.barID = barID
        })

        const [barDownloadResult, menuDownloadResult] = await Promise.all(
            [ this.getBarInfo(barID), this.getBarMenu(barID) ])
        console.log("GOT RESULTSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
        console.log(barDownloadResult)
        console.log(menuDownloadResult)
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

    setBarID = logErrors(this._setBarID)

    _setBarList = async (location) => {
        const loc = location || store.location
        this.barList.downloadFinished([])
        // this.barList.downloadStarted()
        // const downloadResult = await this.getBarInfo("1")
        // this.barList = downloadResult.update((value) => [value])
    }

    setBarList = logErrors(this._setBarList)

    @action setBarDownloadResult = (downloadResult) => {
        this.bar = downloadResult
    }

    @action setMenuDownloadResult = (downloadResult) => {
        this.menuDownloadResult = downloadResult
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
        const menuItems = subMenus.map((subMenu) => subMenu.menuItems)
        return _.flatten(menuItems)
    }

}

export const barStore = new BarStore()
