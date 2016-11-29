import { observable, transaction, computed, action, autorun } from 'mobx'
import { barStore } from '../barstore'
import { loginStore } from '../loginstore'
import { downloadManager } from '/network/http'
import { ActiveOrderDownload } from '/network/api/admin/active-orders'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/activeorderstore.js')

class ActiveOrderStore {
    @observable activeOrderList : Array<OrderResult> = []
    @observable barID = null

    /*********************************************************************/
    /* Downloads                                                         */
    /*********************************************************************/

    initialize = () => {
        downloadManager.declareDownload(new ActiveOrderDownload(
            () => {
                return {
                    barID: barStore.barID,
                    authToken: loginStore.getAuthToken(),
                    userIsBarOwner: loginStore.isBarOwner,
                }
            },
            {
                onFinish: () => {
                    const feed = this.getActiveOrderFeed()
                    if (feed.state === 'Finished') {
                        if (feed.orderDeleted) {
                            this.deleteActiveOrderItem(feed.orderID)
                        } else {
                            this.addActiveOrderItem(feed.orderResult)
                        }
                    }
                }
            }
        ))
    }

    getActiveOrderFeed = () => downloadManager.getDownload('active orders')

    /*********************************************************************/
    /* Active Order List                                                 */
    /*********************************************************************/

    @action addActiveOrderItem = (orderResult : OrderResult) => {
        assert(orderResult != null, "orderResult is null...")
        assert(orderResult.orderID != null, "ordderResult.orderID is null...")
        for (var i = 0; i < this.activeOrderList.length; i++) {
            const orderResult2 = this.activeOrderList[i]
            if (orderResult.orderID === orderResult2.orderID) {
                this.activeOrderList[i] = orderResult
                return
            }
        }

        /* No existing order with orderResult.orderID, add new */
        this.activeOrderList.push(orderResult)
    }

    @action clearActiveOrders = () => {
        this.activeOrderList = []
    }

    /*********************************************************************/
    /* Bar Changes                                                       */
    /*********************************************************************/

    @computed get barIDHasChanged() {
        return this.barID !== barStore.barID
    }
}

export const activeOrderStore = new ActiveOrderStore()

autorun(() => {
    if (barStore.barIDHasChanged) {
        activeOrderStore.clearActiveOrders()
        activeOrderStore.barID = barStore.barID
    }
})
