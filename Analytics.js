import { barStore, tagStore, mapStore, segment } from './Store.js'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

export class Analytics {

    @computed get menuItemsListID() {
        return 'menuItemsAt_' + barStore.barID
    }

    @computed get productList() {
        return tagStore.activeMenuItems.map(
            menuItem => {
                return {
                    product_id: menuItem.id,
                }
            }
        )
    }

    @computed get category() {
        if (tagStore.tagSelection.length > 0)
            return tagStore.tagSelection[0]
        return 'allItems'
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

}

export const analytics = new Analytics()
