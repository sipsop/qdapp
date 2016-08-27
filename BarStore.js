import { observable, transaction, computed, action } from 'mobx'
import { Alert, AsyncStorage } from 'react-native'
import _ from 'lodash'

import { OrderItem } from './Orders.js'
import { emptyResult, downloadManager } from './HTTP.js'
import { cache } from './Cache.js'
import { logErrors, runAndLogErrors, logError, safeAutorun } from './Curry.js'
import { orderStore } from './Orders.js'
import { favStore } from './Fav.js'
import { tabStore } from './Tabs.js'
import { store } from './Store.js'

class BarStore {
    // DownloadResult[schema.Bar]
    @observable bar   = emptyResult()

    // DownloadResult[ List[schema.Bar] ]
    @observable barList = emptyResult()

    // BarID
    @observable barID = emptyResult()

    getState = () => {
        return {
            barState: {
                barID: this.barID,
            }
        }
    }

    @action setState = async (state) => {
        const barState = state.barState
        if (barState.barID)
            await this._setBarID(barState.barID)
    }

    initialize = async () => {
        await this._setBarList()
    }

    refreshBar = logErrors(async () => {
        if (this.barID)
            await this._setBarID(this.barID)
    })

    getBarDownloadResult = () => this.bar
    getBarListDownloadResult = () => this.barList
    getBar = () => this.bar.value

    getBarInfo = async (barID, menu) => {
        const menuQuery = !menu ? '' : `
            menu {
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
        `
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

        var query = `
            query {
                bar(id: "${barID}") {
                    id
                    name
                    desc
                    images
                    tags
                    phone
                    website
                    openingTimes {
                        day
                        openTime {
                            hour
                            minute
                        }
                        closeTime {
                            hour
                            minute
                        }
                    }
                    address {
                        lat
                        lon
                        city
                        street
                        number
                        postcode
                    }
                    ${menuQuery}
                }
            }
            `

            key = `qd:bar=${barID}:menu=${menu}`
            if (menuQuery)
                query += fragments

            isRelevant = () => barID === this.barID
            const downloadResult = await downloadManager.graphQL(
                key, query, isRelevant)
            return downloadResult.update((data) => data.bar)
    }

    _setBarID = async (barID) => {
        if (this.bar.value && this.bar.value.id === barID)
            return /* All done */

        transaction(() => {
            this.setBarDownloadResult(emptyResult().downloadStarted())
            this.barID = barID
        })

        const downloadResult = await this.getBarInfo(barID, true)
        if (this.barID === barID) {
            /* NOTE: a user may have selected a different bar
                     before this download has completed, in
                     which case we should ignore the download.
            */
            this.setBarDownloadResult(downloadResult)
        }
    }

    setBarID = logErrors(this._setBarID)

    _setBarList = async (location) => {
        const loc = location || store.location
        this.barList.downloadStarted()
        const downloadResult = await this.getBarInfo("1")
        this.barList = downloadResult.update((value) => [value])
    }

    setBarList = logErrors(this._setBarList)

    @action setBarDownloadResult = (downloadResult) => {
        this.bar = downloadResult
    }

    @computed get menu() {
        const bar = this.getBar()
        if (!bar)
            return null
        return bar.menu
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
