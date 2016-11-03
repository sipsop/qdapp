import React from 'react'
import {
  TextInput,
  View,
  Platform
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'
import { searchStore } from '/model/store'

const styles = {
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
        type: 'menu' | 'bar'
    */

    _onSearchChanged = (text) => {
      // fire search query here
      if (this.props.type === 'menu') {
          searchStore.setMenuSearch(text)
      } else if (this.props.type === 'bar') {
          searchStore.setBarSearch(text)
      }
    }

    @computed get searchText() {
        if (this.props.type === 'menu') {
            return searchStore.menuSearch
        } else if (this.props.type === 'bar') {
            return searchStore.barSearch
        } else {
            throw Error(`Unknown search box: ${this.props.type}`)
        }
    }

    render = () => {
        return (
            <View style={styles.view}>
              <View style={styles.searchBarContainer}>
                <TextInput
                    placeholder={this.props.placeholder}
                    value={this.searchText}
                    style={styles.input}
                    onChangeText={this._onSearchChanged}
                />
              </View>
              <View style={styles.seperator} />
            </View>
        )
    }
}
