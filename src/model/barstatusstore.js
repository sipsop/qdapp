import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager, latest } from '/network/http'
import { BarStatusDownload } from '/network/api/barstatus/status'
import { UpdateBarStatusDownload } from '/network/api/barstatus/status-update'
import { segment } from '/network/segment'
import { barStore } from './barstore'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('./model/barstatusstore.js')

export type TableService =
    | 'Disabled'
    | 'Food'
    | 'Drinks'
    | 'FoodAndDrinks'

export type PickupLocation = {
    name: String,
    open: Bool,
}

/* Bar status query results */
export type BarStatus = {
    qdodger_bar: Bool,
    taking_orders: Bool,
    table_service: TableService,
    pickup_locations: Array<PickupLocation>,
}

/* Bar status update queries */
export type StatusUpdate = {
    TakingOrders: Bool,
    SetTableService: TableService,
    AddBar: {
        name: String,
        listPosition: Int,
    },
    SetBarOpen: {
        name: String,
        open: Bool,
    },
}

class BarStatusStore {

    /*********************************************************************/
    /* State */
    /*********************************************************************/

    emptyState = () => {}
    getState = () => {}
    setState = async (barStatusState) => undefined

    getDownloadProps = () => {
        return {
            barID: barStore.barID,
        }
    }

    /*********************************************************************/
    /* Downloads */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new BarStatusDownload(() => {
            return {
                barID: barStore.barID,
            }
        }))
        downloadManager.declareDownload(new UpdateBarStatusDownload(() => {
            const barStatusDownload = this.barStatusDownload
            this.barStatusDownload = null
            return {
                barID:           barStore.barID,
                authToken:       loginStore.getAuthToken(),
                barStatusUpdate: barStatusUpdate,
            }
        }))
    }

    @computed get barStatusDownload() {
        return latest(
            downloadManager.getDownload('bar status'),
            downloadManager.getDownload('bar status update'),
        )
    }

    getBarStatusDownload = () => this.barStatusDownload

    /*********************************************************************/
    /* Computed bar status */
    /*********************************************************************/

    @computed get barStatus() : ?BarStatus {
        return this.barStatusDownload.barStatus
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
        let message = null
        let closeable = false
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

    /*********************************************************************/
    /* Bar Status State Updates */
    /*********************************************************************/

    @observable barStatusUpdate : StatusUpdate = null

    @action setTakingOrders = (takingOrders : Bool) => {
        this.barStatusUpdate = {
            TakingOrders: true,
        }
    }

    @action setTableService = (tableService : TableService) => {
        this.barStatusUpdate = {
            SetTableService: tableService,
        }
    }

    @action addBar = (barName : String) => {
        this.barStatusUpdate = {
            AddBar: {
                name: barName,
                listPosition: this.pickupLocations.length,
            }
        }
    }

    @action setBarOpen = (barName : String, open : Bool) => {
        this.barStatusUpdate = {
            SetBarOpen: {
                name: barName,
                open: open,
            }
        }
    }
}

export const barStatusStore = new BarStatusStore()
