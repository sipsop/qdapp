import { React, Component, View, TouchableOpacity, T, Mono, PureComponent } from '../Component.js'
import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { DownloadResult, DownloadResultView, emptyResult, downloadManager } from '../HTTP.js'
import * as _ from '../Curry.js'
import { segment } from '../Segment.js'
import { barStore } from './BarStore.js'
import { config } from '../Config.js'

const { assert, log } = _.utils('./Bar/BarStatus.js')

/*********************************************************************/
/* Bar Status */

export type TableService =
    | 'Disabled'
    | 'Food'
    | 'Drinks'
    | 'FoodAndDrinks'

export type BarStatus = {
    qdodger_bar: Bool,
    taking_orders: Bool,
    table_service: TableService,
    pickup_locations: Array<String>,
}

/* Update bar status every 5 minutes */
const TIMEOUT = 1000 * 60 * 5

class BarStatusStore {

    @observable barStatusDownload : DownloadResult<BarStatus> = emptyResult().downloadStarted()

    emptyState = () => {}
    getState = () => {}
    setState = async (barStatusState) => undefined

    periodicallyDownloadBarStatus = async () => {
        await this.downloadBarStatus()
        setTimeout(this.periodicallyDownloadBarStatus, TIMEOUT)
    }

    downloadBarStatus = async () => {
        barID = barStore.barID
        this.barID = barID
        const barStatusQuery = {
            BarStatus: {
                args: {
                    /* NOTE: Use require() to resolve cyclic dependency */
                    barID: barID,
                },
                result: {
                    bar_status: {
                        qdodger_bar:      'Bool',
                        taking_orders:    'Bool',
                        table_service:    'String',
                        pickup_locations: ['String'],
                    }
                }
            }
        }
        this.barStatusDownload.downloadStarted()
        this.barStatusDownload = await downloadManager.query(
            `qd:bar:status:barID=${barID}`,
            barStatusQuery,
            config.defaultRefreshCacheInfo,
        )
        // log("Got bar status result:", this.barStatusDownload)
    }

    @computed get barStatus() : ?BarStatus {
        return this.barStatusDownload.value &&
               this.barStatusDownload.value.bar_status
    }

    @computed get isQDodgerBar() : Bool {
        return this.barStatus && this.barStatus.qdodger_bar
    }

    @computed get takingOrders() : Bool {
        return this.barStatus && this.barStatus.taking_orders
    }

    @computed get tableService() : String {
        return this.barStatus && this.barStatus.table_service
    }

    @computed get pickupLocations() : Array<String> {
        return this.barStatus && this.barStatus.pickup_locations
    }

    /* Update bar status when barID changes */

    @observable barID = null

    @computed get barIDChanged() {
        return barStore.barID != this.barID
    }

    getBarStatusNotification = () => {
        var message = null
        var closeable = false
        if (!this.isQDodgerBar) {
            message = 'No menu available :('
        } else if (!this.takingOrders) {
            message = `Sorry, the bar is not currently accepting orders`
            closeable = true
        } else if (!this.tableService) {
            message = `No table service available, sorry.`
            closeable = true
        }

        if (!message)
            return null

        return {
            message: message,
            closeable: closeable,
        }
    }
}

export const barStatusStore = new BarStatusStore()


autorun(() => {
    /* Run this immediately whenever barID changes */
    if (barStatusStore.barIDChanged) {
        // log("DOWNLOADING...", barStore.barID)
        barStatusStore.downloadBarStatus()
    }
})
