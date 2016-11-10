import {
    React,
    View,
    T,
    Platform,
    PureComponent,
    TouchableOpacity,
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { computed } from 'mobx'

import { PINK_COLOR } from '/utils/appstyles/appColors'


const styles = StyleSheet.create({
    autocomplete: {
        position: 'absolute',
        top: 0,
        width:  200,
        height: 300,
    },
    row: {
        flex: 1,
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
        return <View style={{height: 300}}>
            {
                suggestions.map(suggestion => {
                    return (
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => this.onSelect(suggestion)}
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
