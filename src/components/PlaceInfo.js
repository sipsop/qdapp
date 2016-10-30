import {
    React,
    View,
    TouchableOpacity,
    StyleSheet,
    PureComponent,
    T,
} from '~/src/components/Component'
import { observer } from 'mobx-react/native'
import { tabStore, mapStore } from '~/src/model/store.js'
import Icon from 'react-native-vector-icons/FontAwesome'


const styles = StyleSheet.create({
    buttonStyle: {
        width: 50,
        height: 50,
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    buttonItems: {
        margin: 5,
        alignItems: 'center'
    },
    text: {
        color: '#fff',
        fontSize: 14
    }
})

@observer
export class PlaceInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */

    handlePress = () => {
        tabStore.setCurrentTab(0)
        mapStore.focusBar(this.props.bar, true, track = true)
        // mapStore.currentMarker = this.props.bar
        // TODO: Scroll to top
    }

    render = () => {
        return (
            <View>
                <TouchableOpacity onPress={this.handlePress} style={styles.buttonStyle}>
                    <View style={styles.buttonItems}>
                        <Icon name="map-marker" size={30} color="rgb(181, 42, 11)" />
                        <T style={styles.text}>
                            MAP
                            {/* this.props.bar.address.city */}
                        </T>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}
