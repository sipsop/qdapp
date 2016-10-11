import { barStore, tagStore, mapStore, orderStore, segment } from './Store.js'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

export class Analytics {

    @computed get menuItemsListID() {
        return 'menuItemsAt_' + barStore.barID
    }

    @computed get productList() {
        return getProductList(tagStore.activeMenuItems)
    }

    @computed get category() {
        if (tagStore.tagSelection.length > 0)
            return tagStore.tagSelection[0]
        return 'allItems'
    }

    /* Tabs */

    trackTabSwitch = (tabNo) => {
        segment.screen(getScreenName(tabNo))
        if (tabNo === 3)
            this.trackCartViewed()
    }

    /* Bar Page */

    trackMenuCardClick = (tagID) => {
        segment.trackCurrentBar('Menu Card Clicked', {
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
            filters:    tagStore.tagSelection.map(
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
        segment.track('Product Viewed', { // getProductInfo(menuItem, position))
            product_id: menuItem.id,
        })
    }

    trackMenuItemClicked = (menuItem, position = undefined) => {
        segment.track('Product Clicked', getProductInfo(menuItem, position))
        this.trackMenuItemViewed(menuItem, position)
    }

    /* Order */

    trackAddItem = (menuItem, orderItem) => {
        segment.track('Product Added', {
            product_id: menuItem.id,
            variant:    getVariant(orderItem),
        })
    }

    trackRemoveItem = (menuItem, orderItem) => {
        segment.track('Product Removed', {
            product_id: menuItem.id,
            variant:    getVariant(orderItem),
        })
    }

    trackCartViewed = () => {
        segment.track('Cart Viewed', {
            cart_id:    orderStore.cartID,
            products:   getProductList(orderStore.menuItemsOnOrder)
        })
    }

    /* Checkout */

    // TODO:
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


const getProductInfo = (menuItem, position = undefined) => {
    const result = {
        product_id: menuItem.id,
        category:   this.category,
        name:       menuItem.name,
        price:      getPrice(menuItem.price),
        currency:   getCurrencyCode(menuItem.price),
        // TODO: brand
    }
    /* TODO: Segment docs say we need the *same* properties for
             'Checkout Started' etc as 'Product Added'. However, we
             don't have access to 'position' during checkout.

             Is this a problem?
    */
    if (position != null)
        result.position = position
    return result
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

const getProductOrderInfo = (menuItem, orderItem, position = undefined) => {
    const productInfo = getProductInfo(menuItem, position)
    return {
        ...productInfo,
        variant: getVariant(orderItem),
    }
}

const getVariant = (orderItem) => {
    return JSON.stringify(orderItem.selectedOptions)
}

const getPrice = (price : Price) => {
    return price.price / 100
}

const getCurrencyCode = (price : Price) => {
    switch (price.currency) {
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
