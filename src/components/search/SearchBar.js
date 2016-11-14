import {
    React,
    TextInput,
    View,
    Platform,
    TouchableOpacity,
    MaterialIcon,
    PureComponent,
} from '/components/Component'
import { computed, observable, action } from 'mobx'
import { observer } from 'mobx-react/native'
import dismissKeyboard from 'react-native-dismiss-keyboard'

// import { searchStore } from '/model/store'
import { AutoComplete } from './AutoComplete'
import { config } from '/utils/config'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/search/SearchBar')

const styles = {
    view: {
    },
    searchBarContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginLeft: 5,
        marginRight: 5,
        height: 50,
        borderWidth: 0.5,
        borderColor: '#000',
        // borderColor: config.theme.primary.medium,
        borderRadius: 5,
    },
    searchInput: {
        flex: 1,
        height: Platform.OS === 'ios' ? 30 : 40,
        textAlign: 'center',
        fontSize: 20,
        color: '#000',
        borderColor: config.theme.primary.medium,
        marginBottom: -5,
        marginLeft: 5,
        marginRight: 5,
    },
    iconButtonLeft: {
        width: 35,
        marginLeft: 20,
        marginRight: 10,
    },
    iconButtonRight: {
        width: 35,
        marginLeft: 10,
        marginRight: 10,
    },
}

/* Search bar on top, which fires the search query and populates a list (SearchResults) with results. */
@observer
export class SearchBar extends PureComponent {
    /* properties:
        placeholder: String
        searchStore: SearchStore
    */

    @action handleSubmitSearch = () => {
        dismissKeyboard()
    }

    render = () => {
        return (
            <View style={styles.view}>
                <SearchInput
                    placeholder={this.props.placeholder}
                    searchStore={this.props.searchStore}
                    onSubmitSearch={this.handleSubmitSearch}
                    />
                <AutoComplete searchStore={this.props.searchStore}
                    suggestions={this.props.searchStore.suggestions}
                    onSelect={(text) => {
                        this.props.searchStore.setSearchText(text)
                        this.handleSubmitSearch()
                    }}
                    />
            </View>
        )
    }
}

@observer
class SearchInput extends PureComponent {
    /* properties:
        placeholder: String
        searchStore: SearchStore
        onSubmitSearch: () => void
    */
    render = () => {
        const { searchStore, placeholder, submitSearch } = this.props
        return (
            <View style={styles.searchBarContainer}>
                <View style={styles.iconButtonLeft} />
                <TextInput
                    placeholder={placeholder}
                    style={styles.searchInput}
                    value={searchStore.searchText}
                    onChangeText={searchStore.setSearchText}
                    onSubmitEditing={this.props.onSubmitSearch}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    />
                { !!searchStore.searchText
                    ? <TouchableOpacity
                            style={styles.iconButtonRight}
                            onPress={searchStore.clearSearch}>
                        <MaterialIcon
                            name="clear"
                            size={35}
                            color="#000"
                            />
                    </TouchableOpacity>
                    : <View style={styles.iconButtonRight} />

                }
            </View>
        )
    }
}
