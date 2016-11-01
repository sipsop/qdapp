import React from 'react'
import {
  TextInput,
  View,
  ListView
} from 'react-native'
import {
    PureComponent
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { action } from 'mobx'

const styles = {
    input: {
        height: 35,
        textAlign: 'center'
    },
    seperator: {
        height: 1,
        backgroundColor: '#cecece'
    }
}
@observer
export class SearchResults extends PureComponent {
    @action _onChangeSearchString = (text) => {
      // fire search query here
    }
    render = () => {
        return (
            <View>
              <ListView
              
              />
            </View>
        )
    }
}
