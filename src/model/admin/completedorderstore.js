import { observable, transaction, computed, action, autorun } from 'mobx'
import { barStore } from '../barstore'
import { loginStore } from '../loginstore'
import { downloadManager } from '/network/http'
import { CompletedOrdersDownload } from '/network/api/admin/completed-orders'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/activeorderstore.js')

class CompletedOrderStore {
    @observable completed : Array<OrderResult> = []
    @observable barID = null
    @observable endReached = false
    @observable shouldFetchMore = false

    /*********************************************************************/
    /* Downloads                                                         */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new CompletedOrdersDownload(
            () => {
                return {
                    authToken: loginStore.getAuthToken(),
                    barID: barStore.barID,
                    completedBefore: this.getBeforeTimestamp(),
                    active: this.shouldFetchMore,
                }
            },
            {
                onStart: () => {
                    this.shouldFetchMore = false
                },
                onFinish: () => {
                    const completed = this.getDownload().completedOrders
                    if (completed) {
                        if (completed.length) {
                            this.addCompletedOrders(completed)
                        } else {
                            log("END REACHED!!!!")
                            this.endReached = true
                        }
                    }
                }
            }
        ))
    }

    @action refresh = () => {
        this.clearCompletedOrders()
        this.fetchMore()
    }

    @action fetchMore = () => {
        if (!this.endReached && this.getDownload().state !== 'Error') {
            this.shouldFetchMore = true
        }
    }

    getDownload = () => downloadManager.getDownload('completed orders')

    getBeforeTimestamp = () : ?Float => {
        if (!this.completed.length)
            return undefined
        return _.last(this.completed).completedTimestamp
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    @action addCompletedOrders = (completed : Array<OrderResult>) => {
        completed.forEach(orderResult => {
            this.completed.push(orderResult)
        })
    }

    @action clearCompletedOrders = () => {
        this.completed = []
        this.endReached = false
    }

    /*********************************************************************/
    /* Bar Changes                                                       */
    /*********************************************************************/

    @computed get barIDHasChanged() {
        return this.barID !== barStore.barID
    }
}

export const completedOrderStore = new CompletedOrderStore()

autorun(() => {
    if (completedOrderStore.barIDHasChanged) {
        completedOrderStore.clearCompletedOrders()
        completedOrderStore.barID = barStore.barID
    }
})
