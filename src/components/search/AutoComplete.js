import {
    React,
    View,
    T,
    Platform,
    ScrollView,
    PureComponent,
    TouchableOpacity,
    StyleSheet,
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { computed } from 'mobx'
import { config } from '/utils/config'

const styles = StyleSheet.create({
    autocomplete: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 5,
        marginLeft: 20,
        marginRight: 20,
        borderBottomWidth: 0.5,
        borderColor: '#f2f2f2',
    },
    row: {
        flex: 1,
        width: 200,
        height: 40,
    },
    suggestionButton: {
        borderWidth: 0.5,
        borderRadius: 3,
        margin: 5,
        padding: 10,
    },
    suggestion: {
        fontSize: 18,
        color: '#000',
    },
})

export class AutoComplete extends PureComponent {
    /* properties:
        suggestions: [String]
        onSelect: (String) => void
    */

    render = () => {
        if (!this.props.suggestions.length)
            return null

        return (
            <View style={styles.autocomplete}>
                {
                    this.props.suggestions.map((suggestion, i) => {
                        return (
                            <View key={i}>
                                <TouchableOpacity
                                    key={i}
                                    style={styles.suggestionButton}
                                    onPress={() => this.props.onSelect(suggestion)}
                                    >
                                    <T style={styles.suggestion}>
                                        {suggestion}
                                    </T>
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }
            </View>
        )
    }
}
