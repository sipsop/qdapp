import React from 'react'
import {
  TextInput,
  View,
  TouchableOpacity,
  Image
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { action } from 'mobx'

const styles = {
    input: {
        height: 25,
        textAlign: 'center',
        flex: 1
    },
    seperator: {
        height: 1,
        backgroundColor: '#cecece'
    },
    searchBtn: {
        height: 30,
        width: 30
    },
    searchBarContainer: {
        flexDirection: 'row',
        margin: 4
    }
}

/* Search bar on top, which fires the search query and populates a list (SearchResults) with results. */
@observer
export class SearchBar extends PureComponent {

    constructor (props) {
        super(props)
        this.state = {
            searchString: ''
        }
    }

    @action _onSearchPress = (text) => {
      // fire search query here
    }
    render = () => {
        return (
            <View>
              <View style={styles.searchBarContainer}>
                <TextInput
                    placeholder={this.props.placeholder}
                    style={styles.input}
                />
                <TouchableOpacity onPress={this._onSearchPress}>
                  <Image
                      style={styles.searchBtn}
                      source={require('../../../logos/search.png')}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.seperator} />
            </View>
        )
    }
}
