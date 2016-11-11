import React from 'react'
import {
  TextInput,
  View,
  Platform
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { computed, observable, action } from 'mobx'
import { observer } from 'mobx-react/native'
import dismissKeyboard from 'react-native-dismiss-keyboard'

// import { searchStore } from '/model/store'
import * as _ from '/utils/curry.js'
import { AutoComplete } from './AutoComplete'

const { log, assert } = _.utils('/components/search/SearchBar')

const styles = {
    fullScreen: {
        flex: 1,
    },
    searchBar: {

    },
    input: {
        height: Platform.OS === 'ios' ? 25 : 45,
        textAlign: 'center',
        flex: 1
    },
    seperator: {
        height: 1,
        backgroundColor: '#cecece'
    },
    searchBarContainer: {
        flexDirection: 'row',
        margin: 4
    }
}

/* Search bar on top, which fires the search query and populates a list (SearchResults) with results. */
@observer
export class SearchBar extends PureComponent {
    /* properties:
        placeholder: String
        items: Array<T>
        getWords: (T) => Array<String>
        onSubmitSearch: (Array<T>) => void
    */

    @observable searchText = ""
    @observable searchActive = false

    @computed get searchTerm() {
        return this.searchText.toLowerCase()
    }

    @computed get allWords() {
        return _.unique(_.flatten(this.props.items.map(this.props.getWords)))
                    .map(word => word.toLowerCase())
    }

    @computed get suggestions() {
        return this.allWords.filter((word) => word.includes(this.searchTerm))
    }

    @computed get activeItems() {
        return this.props.items.filter((item) => {
            return this.props.getWords(item).join('|').toLowerCase().includes(this.searchTerm)
        })
    }

    @computed get showAutoComplete() {
        return !!(this.searchActive && this.searchText)
    }

    @action clearSearch = () => {
        this.searchText = ""
        this.searchActive = false
    }

    handleSearchChanged = (text) => {
        this.searchText = text
    }

    @action handleSubmitSearch = (text) => {
        this.searchText = text
        this.searchActive = false
        dismissKeyboard()
        this.props.onSubmitSearch(this.activeItems)
    }

    render = () => {
        const viewStyle = this.searchActive ? styles.fullScreen : styles.searchBar
        return (
            <View style={viewStyle}>
                <View style={styles.searchBarContainer}>
                    <TextInput
                        placeholder={this.props.placeholder}
                        value={this.searchText}
                        style={styles.input}
                        onChangeText={this.handleSearchChanged}
                        onSubmitEditing={() => this.handleSubmitSearch(this.searchText)}
                        onFocus={() => this.searchActive = true}
                        onEndEditing={() => this.handleSubmitSearch(this.searchText)}
                    />
                </View>
                {this.showAutoComplete &&
                    <AutoComplete
                        suggestions={this.suggestions}
                        onSelect={this.handleSubmitSearch}
                     />
                }
            </View>
        )
    }
}
