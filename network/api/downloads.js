import { observable, computed, transaction, action, autorun } from 'mobx'
// import { observer } from 'mobx-react/native'

import { JSONDownload, QueryDownload, QueryMutation } from './HTTP.js'
import { buildURL } from './URLs.js'
import { MenuItemQuery } from './Bar/MenuQuery.js'
import { OrderResultQuery } from './Orders/OrderQuery.js'
import { config } from './Config.js'

/***********************************************************************/
/* Initialization                                                      */
/***********************************************************************/

/* Object to hold all stores:

    barStore
    tagStore
    orderStore
    etc
*/
type Stores = {
    barStore:       BarStore,
    loginStore:     LoginStore,
    orderStore:     OrderStore,
    paymentStore:   PaymentStore,
    // ...
}


var stores : Stores = null

export const initialize = (_stores, downloadManager) => {
    stores = _stores
    // downloadManager.declareDownload(new BarInfoDownload())
    downloadManager.declareDownload(new BarOwnerProfileDownload())
    downloadManager.declareDownload(new BarStatusDownload())
    // downloadManager.declareDownload(new MenuDownload())

    downloadManager.declareDownload(new TagsDownload())
}
