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

import { PINK_COLOR } from '/utils/appstyles/appColors'


const styles = StyleSheet.create({
    autocomplete: {
        flex: 1,
        alignItems: 'center',
        // position: 'absolute',
        // top:    40,
        // width:  200,
        // height: 300,
        // zIndex: 999,
    },
    row: {
        flex: 1,
        width: 200,
        height: 40,
    },
    suggestion: {
        fontSize: 16,
        // color: '#000',
    },
    separator: {
        backgroundColor: '#f2f2f2',
        height: 1,
        marginRight: 15,
        marginLeft: 15,
    },
})

export class AutoComplete extends PureComponent {
    /* properties:
        suggestions: [String]
        onSelect: (String) => void
    */

    render = () => {
        return <View style={styles.autocomplete}>
            {
                this.props.suggestions.map((suggestion, i) => {
                    return (
                        <TouchableOpacity
                            key={i}
                            style={styles.row}
                            onPress={() => this.props.onSelect(suggestion)}
                            >
                            <T style={styles.suggestion}>
                                {suggestion}
                            </T>
                            <View style={styles.separator} />
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    }
}
