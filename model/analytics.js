import { computed } from 'mobx'
import { observer } from 'mobx-react/native'
import * as _ from '/utils/curry.js'

/* The './store.js' module. Bind this late so that stores can use this modules. */
var stores = null

export class Analytics {

    checkoutID = null
    stepNumber = null

    initialize = () => {
        stores = require('./store.js')
    }

    @computed get menuItemsListID() {
        return 'menuItemsAt_' + stores.barStore.barID
    }

    @computed get productList() {
        return getProductList(stores.tagStore.activeMenuItems)
    }

    @computed get category() {
        if (stores.tagStore.tagSelection.length > 0)
            return stores.tagStore.tagSelection[0]
        return 'allItems'
    }

    /* Helpers */

    trackCurrentBar = (event, properties) => {
        segment.track(event, {...this.barProps(stores.barStore.getBar()), ...properties})
    }

    barProps = (bar : ?Bar) => {
        if (!bar)
            return null
        return {
            placeID:    bar.id,
            placeName:  bar.name,
        }
    }

    /* Tabs */

    trackTabSwitch = (tabNo) => {
        segment.screen(getScreenName(tabNo))
        if (tabNo === 3)
            this.trackCartViewed()
    }

    /* Bar Stuff */

    trackSelectBar = (barID, barName) => {
        segment.track('Select Bar', {
            placeID:    barID,
            placeName:  barName,
        })
    }

    trackBarRefresh = (barID, barName) => {
        segment.track('Refresh Bar', {
            placeID:    barID,
            placeName:  barName,
        })
    }

    trackMenuCardClick = (tagID) => {
        this.trackCurrentBar('Menu Card Clicked', {
            tag: tagID,
        })
    }

    /* Menu Page */

    trackScrollMenu = (rowNumber) => {
        if (rowNumber % 10 !== 0)
            return /* Track in chunks... */

        segment.track('Product List Viewed', {
            list_id:    this.menuItemsListID,
            category:   this.category,
            products:   this.productList.slice(rowNumber, rowNumber + 10),
        })
    }

    trackTagFilter = () => {
        segment.track('Product List Filtered', {
            list_id:    this.menuItemsListID,
            category:   this.category,
            filters:    stores.tagStore.tagSelection.map(
                (tagID) => {
                    return {
                        type:  'tag',
                        value: tagID,
                    }
                }
            ),
            products:   this.productList,
        })
    }

    trackMenuItemViewed = (menuItem, position = undefined) => {
        segment.track('Product Viewed', getProductInfo(menuItem))
    }

    trackMenuItemClicked = (menuItem, position = undefined) => {
        segment.track('Product Clicked', getProductInfo(menuItem))
        this.trackMenuItemViewed(menuItem, position)
    }

    /* Order */

    trackAddItem = (menuItem, orderItem) => {
        segment.track('Product Added', {
            cart_id:    stores.orderStore.cartID,
            product_id: menuItem.id,
            variant:    getVariant(orderItem),
        })
    }

    trackRemoveItem = (menuItem, orderItem) => {
        segment.track('Product Removed', {
            cart_id:    stores.orderStore.cartID,
            product_id: menuItem.id,
            variant:    getVariant(orderItem),
        })
    }

    trackCartViewed = () => {
        segment.track('Cart Viewed', {
            cart_id:    stores.orderStore.cartID,
            products:   getProductList(stores.orderStore.menuItemsOnOrder)
        })
    }

    /* Checkout */

    getCheckoutProps = () => {
        return {
            checkout_id:    this.checkoutID,
            order_id:       this.checkoutID,
            value:          getPrice(stores.orderStore.totalPlusTip),
            // discount:    ..., // TODO:
            // coupon:      ..., // TODO:
            currency:       getCurrencyCode(stores.orderStore.currency),
            // TODO: products.quantity
            products:       stores.orderStore.menuItemsOnOrder.map(getProductInfo),
        }
    }

    trackCheckoutStart = () => {
        this.checkoutID = _.uuid()
        segment.track('Checkout Started', this.getCheckoutProps())
        this.trackCheckoutStep(1)
    }

    trackCheckoutFinish = () => {
        if (this.stepNumber != null) {
            this.trackCheckoutStepFinish(this.stepNumber)
        }
        segment.track('Order Completed', this.getCheckoutProps())
        this.clearCheckoutInfo()
    }

    trackCheckoutCancel = () => {
        segment.track('Order Cancelled', this.getCheckoutProps())
        this.clearCheckoutInfo()
    }

    /* Checkout steps */

    trackCheckoutStep = (stepNumber) => {
        if (this.stepNumber != null) {
            this.trackCheckoutStepFinish(this.stepNumber)
        }
        this.trackCheckoutStepStart(stepNumber)
    }

    trackCheckoutStepStart = (stepNumber) => {
        this.stepNumber = stepNumber
        segment.track('Checkout Step Viewed', {
            checkout_id:    this.checkout_id,
            step:           stepNumber,
        })
    }

    trackCheckoutStepFinish = (stepNumber) => {
        this.stepNmber = null
        segment.track('Checkout Step Completed', {
            checkout_id:    this.checkout_id,
            step:           stepNumber,
        })
    }

    trackEnterPaymentInfo = () => {
        const checkoutID = this.checkoutID || _.uuid()
        segment.track('Payment Info Entered', {
            order_id:       checkoutID,
            checkout_id:    checkoutID,
        })
    }

    /* Checkout info clear */

    clearCheckoutInfo = () => {
        this.checkoutID = null
        this.stepNumber = null
    }

}

const getScreenName = (tabNo) => {
    switch (tabNo) {
        case 0:
            return 'Discover'
        case 1:
            return 'Bar'
        case 2:
            return 'Menu'
        case 3:
            return 'Order'
        default:
            return '?'
    }
}

const getProductList = (productList) => {
    return productList.map(
        menuItem => {
            return {
                product_id: menuItem.id,
            }
        }
    )
}

const getProductInfo = (menuItem) => {
    const result = {
        product_id: menuItem.id,
        category:   this.category,
        name:       menuItem.name,
        price:      getPrice(menuItem.price.price),
        currency:   getCurrencyCode(menuItem.price.currency),
        // TODO: brand
    }
    /* TODO: Segment docs say we need the *same* properties for
             'Checkout Started' etc as 'Product Added'. However, we
             don't have access to 'position' during checkout.

             Is this a problem?
    */
    // if (position != null)
    //     result.position = position
    return result
}

const getProductOrderInfo = (menuItem, orderItem) => {
    const productInfo = getProductInfo(menuItem)
    return {
        ...productInfo,
        variant: getVariant(orderItem),
    }
}

const getVariant = (orderItem) => {
    return JSON.stringify(orderItem.selectedOptions)
}

const getPrice = (price : Float) => {
    return price / 100
}

const getCurrencyCode = (currency : Currency) => {
    switch (currency) {
        case 'Sterling':
            return 'GBP'
        case 'Euros':
            return 'EUR'
        case 'Dollars':
            return 'USD'
        default:
            throw Error(`Unknown currency: ${price.currency}`)
    }
}


export const analytics = new Analytics()
