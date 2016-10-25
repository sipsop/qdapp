import { React, Component, View, TouchableOpacity, T, Mono, PureComponent } from '../Component.js'
import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { DownloadResult, DownloadResultView, emptyResult, downloadManager } from '../HTTP.js'
import { BarStatusDownload } from '../network/api/bar/barstatus.js'
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

class BarStatusStore {

    emptyState = () => {}
    getState = () => {}
    setState = async (barStatusState) => undefined

    getDownloadProps = () => {
        return {
            barID: barStore.barID,
        }
    }

    initialize = () => {
        downloadManager.declareDownload(new BarStatusDownload(this.getDownloadProps))
    }

    @computed get barStatus() : ?BarStatus {
        return downloadManager.getDownload('barStatus').barStatus
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

    @computed get barStatusNotification() {
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
