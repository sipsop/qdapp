import React from 'react'
import {
  View
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { SearchBar } from '/components/search/SearchBar'
import { SearchResults } from '/components/search/SearchResults'

const styles = {
    input: {
        height: 40
    }
}

@observer
export class SearchPage extends PureComponent {

    render = () => {
        return (
          <View>
            <SearchBar />
            <SearchResults />
          </View>
        )
    }

}
