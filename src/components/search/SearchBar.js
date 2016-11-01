import React from 'react'
import {
  TextInput,
  View
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { action } from 'mobx'

const styles = {
    input: {
        height: 30,
        textAlign: 'center'
    },
    seperator: {
        height: 1,
        backgroundColor: '#cecece'
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

    @action _onChangeSearchString = (text) => {
      // fire search query here
    }
    render = () => {
        return (
            <View>
                <TextInput
                    placeholder='Search for bars, drinks, events,...'
                    value={this.state.searchString}
                    style={styles.input}
                />
                <View style={styles.seperator} />
            </View>
        )
    }
}
