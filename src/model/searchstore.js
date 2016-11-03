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

    @computed get currentMenuSearch () {
        return this.menuSearch
    }
    @computed get currentBarSearch () {
        return this.barSearch
    }

    searchMenuItems = (menuItems : Array<MenuItem>) : Array<MenuItem> => {
        return menuItems.filter(
            menuItem => menuItem.name.toLowerCase().includes(this.menuSearch.toLowerCase())
        )
    }

    @action setMenuSearch = (searchString) => {
        this.menuSearch = searchString
    }
    @action setBarSearch = (searchString) => {
        this.barSearch = searchString
    }

}

export const searchStore = new SearchStore()
