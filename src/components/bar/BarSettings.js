import {
    React,
    View,
    PureComponent,
    StyleSheet,
    TouchableOpacity,
    T,
} from '/components/Component'
import { observable, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'
import { Email } from '../Email'
import { store, barStore, barStatusStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/bar/BarSettings')


const styles = StyleSheet.create({
    view: {
        margin: 5,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        color: config.theme.primary.medium,
    },
})

@observer
export class BarSettings extends PureComponent {
    render = () => {
        return (
            <View style={styles.view}>
                <T style={styles.headerText}>
                    You are an admin for this pub!
                </T>
                { !barStatusStore.isQDodgerBar &&
                    <View>
                        <T style={styles.headerText}>
                            Order taking is pending approval.
                            Please send an email to:
                        </T>
                        <Email
                            email="support@qdodger.com"
                            subject={`Order taking for ${barStore.barName} (${barStore.barID})`}
                            style={styles.headerText}
                            />
                    </View>
                }
                { barStatusStore.isQDodgerBar &&
                    <BarSettingsSwitch
                        label="Taking Orders:"
                        onPress={barStatusStore.setTakingOrders}
                        />
                }
            </View>
        )
    }
}

// @observer
// class BarSettingsHeader extends PureComponent {
//     render = () => {
//         return (
//             <T style={styles.headerText}>
//                 You are an admin for this pub!
//                 { !barStatusStore.isQDodgerBar &&
//                     " Order taking is pending approval. Please email support@qdodger.com for help."
//                 }
//             </T>
//         )
//         if (!barStatusStore.isQDodgerBar &&
//                         " Order taking is pending approval. Please email support@qdodger.com for help."
//     }
// }

const switchStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    labelText: {
        flex: 1,
        color: '#000',
        fontSize: 20,
        alignItems: 'center',
    },
    switchView: {
        flex: 1,
        alignItems: 'center',
    },
})

@observer
class BarSettingsSwitch extends PureComponent {
    /* properties:
        label: String
        onPress: (value : Bool) => void
        value: Bool
    */
    render = () => {
        return (
            <View style={switchStyles.row}>
                <T style={switchStyles.labelText}>
                    {this.props.label}
                </T>
                <View style={switchStyles.switchView}>
                    <Switch
                        value={this.props.value}
                        onValueChange={this.props.onPress}
                        onTintColor={config.theme.primary.medium}
                        />
                </View>
            </View>
        )
    }
}
