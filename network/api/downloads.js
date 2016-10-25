import { observable, computed, transaction, action, autorun } from 'mobx'
// import { observer } from 'mobx-react/native'

import { JSONDownload, QueryDownload, QueryMutation } from './HTTP.js'
import { buildURL } from './URLs.js'
import { parseBar } from './Maps/PlaceInfo.js'
import { MenuItemQuery } from './Bar/MenuQuery.js'
import { OrderResultQuery } from './Orders/OrderQuery.js'
import { config } from './Config.js'

const APIKey : Key = 'AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw'
const stripeTestAPIKey = "sk_test_8MKOs1GQ5iKWE5mAi44c36yY"
const stripeAPIKey = stripeTestAPIKey

class SelectedBarInfoDownload extends JSONDownload {
    name = 'barInfo'

    @computed get active() {
        return stores.barStore.barID != null
    }

    @computed get cacheKey() {
        return `qd:placeInfo:${this.placeID}`
    }

    @computed get placeID() {
        return stores.barStore.barID
    }

    @computed get url() {
        return buildURL(
            "https://maps.googleapis.com/maps/api/place/details/json",
            { key: APIKey
            , placeid: this.placeID
            }
        )
    }

    @action finish = () => {
        if (this.value && this.value.status !== 'OK') {
            this.downloadError(this.value.status)
        } else {
            const bar : Bar = parseBar(this.value.result, this.value.html_attributions)
            this.downloadFinished(bar)
        }
    }
}

/* Reusable bar info download */
export class BarInfoDownload extends SelectedBarInfoDownload {
    constructor(placeID) {
        super()
        this._placeID = placeID
    }

    @computed get active() {
        return true
    }

    @computed get placeID() {
        return this._placeID
    }
}

export class HistoryQueryDownload extends QueryDownload {
    name = 'history'

    @computed get cacheKey() {
        return `qd:history:userID${stores.loginStore.userID}`
    }

    @computed get active() {
        return stores.loginStore.isLoggedIn
    }

    @computed get query() {
        return {
            OrderHistory: {
                args: {
                    authToken: stores.loginStore.getAuthToken(),
                    n: 100,
                },
                result: {
                    orderHistory: [OrderResultQuery],
                }
            }
        }
    }

    @computed get orderHistory() {
        return this.lastValue
            ? this.lastValue.orderHistory
            : []
    }
}


class BarOwnerProfileDownload extends QueryDownload {
    name = 'barOwnerProfile'
    cacheInfo = config.defaultRefreshCacheInfo

    @computed get cacheKey() {
        return `qd:barOwnerProfile:userID${stores.loginStore.userID}`
    }

    @computed get active() {
        return stores.loginStore.isLoggedIn
    }

    @computed get query() {
        return {
            UserProfile: {
                args: {
                    authToken: stores.loginStore.getAuthToken(),
                },
                result: {
                    profile: {
                        is_bar_owner: 'Bool',
                        'bars': ['String'],
                    }
                }
            }
        }
    }

    @computed get profile() {
        return this.lastValue.profile
    }

}

class BarQueryDownload extends QueryDownload {

    @computed get active() {
        return stores.barStore.barID != null
    }

    @computed get cacheKey() {
        return `qd:${this.name}:barID=${this.barID}`
    }

    @computed get barID() {
        return stores.barStore.barID
    }
}

class BarStatusDownload extends BarQueryDownload {
    name = 'barStatus'

    // update bar status every 30s
    cacheInfo = config.defaultRefreshCacheInfo
    periodicRefresh = 30

    @computed get query() {
        return {
            BarStatus: {
                args: {
                    /* NOTE: Use require() to resolve cyclic dependency */
                    barID: this.barID,
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
    }

    @computed get barStatus() {
        return this.lastValue.bar_status
    }
}

class TagsDownload extends BarQueryDownload {
    name = 'tags'

    @computed get query() {
        return {
            Tags: {
                args: {
                    barID: this.barID,
                },
                result: {
                    tagInfo: [{
                        tagID:   'String',
                        tagName: 'String',
                        excludes: ['String'],
                    }],
                    tagGraph: [{
                        srcID:  'String',
                        dstIDs: ['String'],
                    }],
                },
            }
        }
    }

    @computed get tags() {
        if (!this.lastValue)
            return { tagInfo: [], tagGraph: [] }
        return this.lastValue
    }
}

class MenuDownload extends BarQueryDownload {
    name = 'menu'

    @computed get query() {
        return {
            fragments: {
                SubMenu: {
                    image:      'String',
                    menuItems:  [MenuItemQuery],
                },
            },
            Menu: {
                args: {
                    barID: this.barID,
                },
                result: {
                    beer:               'SubMenu',
                    wine:               'SubMenu',
                    spirits:            'SubMenu',
                    cocktails:          'SubMenu',
                    water:              'SubMenu',
                    snacks:             'SubMenu',
                    food:               'SubMenu',
                }
            }
        }
    }
}

/***********************************************************************/
/* Order Placement                                                     */
/***********************************************************************/

class StripeTokenDownload extends JSONDownload {
    name = 'stripe'
    cacheKey = 'DO_NOT_CACHE'
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache

    @computed get active() {
        return stores.orderStore.shouldPlaceOrderNow()
    }

    @computed get url() {
        return 'https://api.stripe.com/v1/tokens'
    }

    @computed get card() : Card {
        return stores.paymentStore.getSelectedCard()
    }

    @computed get httpOptions() {
        const properties = {
          'card[number]':       this.card.cardNumber,
          'card[exp_month]':    this.card.expiryMonth,
          'card[exp_year]':     this.card.expiryYear,
          'card[cvc]':          this.card.cvv,
          'card[address_zip]':  this.card.postalCode,
        }

        const body = Object.entries(properties)
            .map(([key, value]) => `${key}=${value}`)
            .reduce((previous, current) => `${previous}&${current}`, '')

        return {
            method: 'POST',
            headers: {
                Accept:         'application/json',
                Authorization:  `Bearer ${stripeAPIKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        }
    }

    /* Result */
    @computed get stripeToken() {
        return this.value && this.value.id
    }
}

class PlaceOrderDownload extends QueryMutation {
    name = 'placeOrder'

    /* Start this download only after the 'stripe' download has finished */
    depends = ['stripe']

    // @computed get active() {
    //     return stores.orderStore.shouldPlaceOrderNow()
    // }

    @computed get query() {
        const orderStore = stores.orderStore
        const total     = orderStore.orderListTotal(orderStore.orderList)
        const orderList = orderStore.orderList.map(orderItem => {
            return {
                id:                     orderItem.id,
                menuItemID:             orderItem.menuItemID,
                selectedOptions:        orderItem.selectedOptions,
                amount:                 orderItem.amount,
            }
        })

        const tableNumber =
            orderStore.delivery === 'Table'
                ? orderStore.tableNumber
                : ""

        const pickupLocation =
            orderStore.delivery === 'Pickup'
                ? orderStore.pickupLocation
                : ""

        const stripeToken = downloadManager.getDownload('stripe').stripeToken

        return {
            PlaceOrder: {
                args: {
                    barID:          barStore.barID,
                    authToken:      loginStore.getAuthToken(),
                    userName:       userName,
                    currency:       currency,
                    price:          total,
                    tip:            orderStore.tipAmount,
                    orderList:      orderList,
                    stripeToken:    stripeToken,
                    delivery:       orderStore.delivery,
                    tableNumber:    tableNumber,
                    pickupLocation: pickupLocation,
                },
                result: {
                    orderResult: OrderResultQuery,
                }
            }
        }
    }

    @computed get orderResult() {
        return this.lastValue && this.lastValue.orderResult
    }
}

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
    downloadManager.declareDownload(new SelectedBarInfoDownload())
    downloadManager.declareDownload(new BarOwnerProfileDownload())
    downloadManager.declareDownload(new BarStatusDownload())
    downloadManager.declareDownload(new TagsDownload())
    downloadManager.declareDownload(new MenuDownload())
}
