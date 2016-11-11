import { observable, computed, action } from 'mobx'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/model/search/SearchStore')

export class SearchStore<T> {
    @observable searchText = ''
    @observable suggestionsThrottler = null
    @observable activeItemsThrottler = null

    constructor(getWords, getItems) {
        this.getWords = getWords
        this.getItems = getItems
    }

    initialize = () => {
        /* Update every 300 ms */
        this.suggestionsThrottler = _.throttle(300, () => this._suggestions)
        this.activeItemsThrottler = _.throttle(1000, () => this._activeItems)
    }

    destroy = () => {
        this.suggestionsThrottler.destroy()
        this.activeItemsThrottler.destory()
    }

    @action setSearchText = (text) => {
        this.searchText = text
    }

    @computed get items() {
        return this.getItems()
    }

    @computed get searchTerm() {
        return this.searchText.toLowerCase()
    }

    @computed get allWords() {
        return _.unique(_.flatten(this.items.map(this.getWords)))
    }

    @computed get suggestions() {
        if (!this.searchText)
            return []
        const result = this.allWords.filter(
            (word) => word.toLowerCase().includes(this.searchTerm)
        )
        if (result.length === 1 && this.searchText === result[0])
            return []
        return _.sortBy(result, term => term.length)
    }

    // @computed get suggestions() {
    //     /* Update suggestions every 50 ms */
    //     return this.suggestionsThrottler && this.suggestionsThrottler.value || []
    // }

    @computed get activeItems() {
        if (!this.searchText)
            return this.items
        return this.items.filter((item) => {
            return this.getWords(item).join('|').toLowerCase().includes(this.searchTerm)
        })
    }

    // @computed get activeItems() {
    //     /* Update active items every second or so */
    //     if (!this.activeItemsThrottler)
    //         return this.getItems()
    //     return this.activeItemsThrottler.value
    // }

    @action clearSearch = () => {
        this.searchText = ""
        this.searchActive = false
    }
}
