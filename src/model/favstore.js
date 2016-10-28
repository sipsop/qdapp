import { observable, action, autorun, computed } from 'mobx'

import { loginStore } from './store.js'
import * as _ from '~/src/utils/curry.js'

class FavStore {
    @observable favItems = []
    @observable favBars = []

    /*********************************************************************/
    /* Initialization                                                    */
    /*********************************************************************/

    initialize = () => {

    }

    getState = () => {
        return {
            favourites: {
                favItems: this.favItems,
                favBars: this.favBars,
            },
        }
    }

    @action setState = ({favourites}) => {
        this.favItems = favourites.favItems
        this.favBars = favourites.favBars
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    toggleFavItem = (menuItemID) => {
        // loginStore.login(() => {
        toggle(this.favItems, menuItemID)
        // })
    }
    toggleFavBar = (barID) => {
        // loginStore.login(() => {
        toggle(this.favBars, barID)
        // })
    }

    isFavItem = (menuItemID) => _.includes(this.favItems, menuItemID)
    isFavBar = (barID) => _.includes(this.favBars, barID)

}

const toggle = (idList, id) => {
    if (_.includes(idList, id))
        idList.remove(id)
    else
        idList.push(id)
}

export const favStore = new FavStore()
