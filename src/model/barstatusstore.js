import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager, latest } from '/network/http'
import { BarStatusDownload } from '/network/api/barstatus/status'
import { UpdateBarStatusDownload } from '/network/api/barstatus/status-update'
import { segment } from '/network/segment'
import { loginStore } from './loginstore'
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

    /* Whether to show a loading indicator for the bar status */
    @observable barStatusLoading = false

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
        downloadManager.declareDownload(new BarStatusDownload(
            () => {
                return {
                    barID: barStore.barID,
                }
            },
            {
                onFinish: () => this.barStatusLoading = false,
            },
        ))
        downloadManager.declareDownload(new UpdateBarStatusDownload(
            () => {
                return {
                    barID:           barStore.barID,
                    authToken:       loginStore.getAuthToken(),
                    statusUpdate:    this.barStatusUpdate,
                }
            }, {
                onStart: () => this.barStatusLoading = true,
            },
        ))
    }

    @computed get barStatusDownload() {
        return downloadManager.getDownload('bar status')
    }

    @computed get updateBarStatusDownload() {
        return downloadManager.getDownload('bar status update')
    }

    getBarStatusDownload = () => this.barStatusDownload

    /*********************************************************************/
    /* Computed bar status */
    /*********************************************************************/

    @computed get barStatus() : ?BarStatus {
        log("GOT BAR STATUS", this.barStatusDownload.barStatus)
        return this.barStatusDownload.barStatus
    }

    @computed get isQDodgerBar() : Bool {
        if (config.test.qdodgerBar)
            return true
        return this.barStatus && this.barStatus.qdodger_bar
    }

    @computed get acceptingOrders() : Bool {
        return this.barStatus && this.barStatus.taking_orders
    }

    @computed get allowOrderPlacing() {
        return (
            this.acceptingOrders &&
            ( this.haveTableService ||
              this.haveOpenPickupLocations
            )
        )
    }

    @computed get haveTableService() {
        return this.tableService !== 'Disabled'
    }

    @computed get haveOpenPickupLocations() {
        return this.openPickupLocations.length > 0
    }

    @computed get tableService() : String {
        if (config.test.tableService)
            return 'FoodAndDrinks'
        return this.barStatus && this.barStatus.table_service
    }

    @computed get pickupLocations() : Array<PickupLocation> {
        const pickupLocations = this.barStatus && this.barStatus.pickup_locations
        if (!(pickupLocations || pickupLocations.length) && config.test.pickupLocations)
            return [{name: 'Main Bar', open: true}, {name: 'First Floor', open: true}]
        return pickupLocations || []
    }

    @computed get openPickupLocations() : Array<PickupLocation> {
        return this.pickupLocations.filter(p => p.open)
    }

    @computed get pickupLocationNames() : Array<String> {
        return this.pickupLocations.map(p => p.name)
    }

    @computed get openPickupLocationNames() : Array<PickupLocation> {
        return this.openPickupLocations.map(p => p.name)
    }

    @computed get barStatusNotification() {
        let message = null
        let closeable = false
        if (!this.isQDodgerBar) {
            message = 'No menu available :('
        } else if (!this.acceptingOrders) {
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

    @action updateBarStatus = (barStatusUpdate : StatusUpdate) => {
        this.barStatusUpdate = barStatusUpdate
        this.updateBarStatusDownload.forceRefresh()
    }

    @action setAcceptingOrders = (acceptingOrders : Bool) => {
        this.updateBarStatus({
            TakingOrders: acceptingOrders,
        })
    }

    @action setTableService = (tableService : TableService) => {
        this.updateBarStatus({
            SetTableService: tableService,
        })
    }

    @action addBar = (barName : String) => {
        this.updateBarStatus({
            AddBar: {
                name: barName,
                listPosition: this.pickupLocations.length,
            }
        })
    }

    @action setBarOpen = (barName : String, open : Bool) => {
        assert(barName != null, "barName is null...")
        assert(open != null, "open is null...")
        this.updateBarStatus({
            SetBarOpen: {
                name: barName,
                open: open,
            }
        })
    }
}

export const barStatusStore = new BarStatusStore()
