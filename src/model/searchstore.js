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

  @computed get currentMenuSearch () {
      return this.menuSearch
  }
  @computed get currentBarSearch () {
      return this.barSearch
  }
  @action setMenuSearch = (searchString) => {
      this.menuSearch = searchString
  }
  @action setBarSearch = (searchString) => {
      this.barSearch = searchString
  }

}

export const searchStore = new SearchStore()
