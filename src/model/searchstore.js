import { observable, computed, action } from 'mobx'

class SearchStore {
    @observable menuSearch = ''
    @observable barSearch = ''

    initialize = () => {
    }

    getState = () => {
        return {
            menuSearch: this.menuSearch,
            barSearch: this.barSearch
        }
    }

    emptyState = () => {
        return {
            menuSearch: '',
            barSearch: ''
        }
    }

    @action setState = (state) => {
        this.menuSearch = state.menuSearch
        this.barSearch  = state.barSearch
    }

    @action setMenuSearch = (searchString) => {
        this.menuSearch = searchString
    }

    @action setBarSearch = (searchString) => {
        this.barSearch = searchString
    }


    /*********************************************************************/
    /* Menu Search / AutoComplete                                        */
    /*********************************************************************/

    // @computed get

    // @computed get activeMenuItems() : Array<MenuItem> {
    //     return tagStore.activeMenuItems.filter(
    //         menuItem => menuItem.name.toLowerCase().includes(this.menuSearch.toLowerCase())
    //     )
    // }
    //
    // @computed get menuItemSuggestions() {
    //     return _.unique(_.flatten(
    //         return this.activeMenuItems.map(menuItem => {
    //             const result = menuItem.tags.slice()
    //             result.push(menuItem.name)
    //             return result
    //         })
    //     ))
    // }

    /*********************************************************************/
    /* Bar Search / AutoComplete                                         */
    /*********************************************************************/

    @computed get activeBarItems() : Array<MenuItem> {
        return mapStore.nearbyBarList.filter(
            bar => bar.name.toLowerCase().includes(this.barSearch.toLowerCase())
        )
    }

    @computed get barItemSuggestions() {
         return _.unique(this.activeBarItems.map(bar => bar.name))
    }
}

export const searchStore = new SearchStore()
