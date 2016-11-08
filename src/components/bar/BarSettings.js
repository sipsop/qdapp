import {
    React,
    View,
    PureComponent,
    StyleSheet,
    TouchableOpacity,
    T,
    Switch,
    Picker,
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
        const isQDodgerBar = barStatusStore.isQDodgerBar || true // TODO:
        return (
            <View style={styles.view}>
                <T style={styles.headerText}>
                    You are an admin for this pub!
                    { !barStatusStore.isQDodgerBar &&
                        "Order taking is pending approval. Please send an email to:"
                    }
                </T>
                { !barStatusStore.isQDodgerBar &&
                    <Email
                        email="support@qdodger.com"
                        subject={`Order taking for ${barStore.barName} (${barStore.barID})`}
                        style={styles.headerText}
                        />
                }
                { isQDodgerBar &&
                    <View>
                        <TakingOrders />
                        <TableService />
                        <PickupLocations />
                        <OpenCloseBar />
                    </View>
                }
            </View>
        )
    }
}

@observer
class TakingOrders extends PureComponent {
    render = () => {
        return (
            <BarSettingsSwitch
                label="Taking Orders:"
                onPress={barStatusStore.setTakingOrders}
                value={barStatusStore.takingOrders}
                />
        )
    }
}

@observer
class TableService extends PureComponent {
    render = () => {
        return (
            <BarSettingsPicker
                label="Table Service:"
                valueLabels={['Disabled', 'Food', 'Drinks', 'Food and Drinks']}
                values={['Disabled', 'Food', 'Drinks', 'FoodAndDrinks']}
                value={barStatusStore.tableService}
                onPress={barStatusStore.setTableService}
                />
        )
    }
}

@observer
class PickupLocations extends PureComponent {
    setSelected = (value) => {
        if (value === 'AddNew') {
            // TODO: Implement
        } else {
            barSettingsStore.selectedPickupLocation = value
        }
    }

    render = () => {
        const locationNames = barStatusStore.pickupLocations.map(
            pickupLocation => pickupLocation.name
        )
        let locationName = barSettingsStore.selectedPickupLocation
        if (locationName == null)
            locationName = locationNames.length > 0 && locationNames[0]

        return (
            <BarSettingsPicker
                label="Pickup Locations:"
                valueLabels={[...locationNames, 'Add New Pickup Location']}
                values={[...locationNames, 'AddNew']}
                value={locationName}
                onPress={this.setSelected}
                />
        )
    }
}

@observer
class OpenCloseBar extends PureComponent {
    openOrCloseLocation = (open: Bool) => {
        barStatusStore.setBarOpen(barSettingsStore.selectedPickupLocation, open)
    }

    @computed get pickupLocations() {
        const result = {}
        barStatusStore.pickupLocations.forEach(pickupLocation => {
            result[pickupLocation.name] = pickupLocation.open
        })
        return result
    }

    render = () => {
        if (!barSettingsStore.selectedPickupLocation)
            return null
        const open = this.pickupLocations[barSettingsStore.selectedPickupLocation]
        return (
            <BarSettingsSwitch
                label="Open/Close Pickup Location:"
                onPress={this.openOrCloseLocation}
                value={open}
                />
        )
    }
}

class BarSettingsStore {
    @observable selectedPickupLocation = null

    /* TODO: getState/setState/emptyState */
}

const barSettingsStore = new BarSettingsStore()


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
            <Row label={this.props.label}>
                <Switch
                    value={this.props.value}
                    onValueChange={this.props.onPress}
                    onTintColor={config.theme.primary.medium}
                    />
            </Row>
        )
    }
}

@observer
class BarSettingsPicker extends PureComponent {
    /* properties:
        label: String
        values: Array<T>
        valueLabels: Array<String>
        selectedValue: T
        onPress: (value : T) => void
    */
    render = () => {
        return (
            <Row label={this.props.label}>
                <Picker
                    selectedValue={this.props.selectedValue}
                    onValueChange={this.props.onPress}
                    >
                    {
                        this.props.values.map((value, i) => {
                            return (
                                <Picker.Item
                                    key={value}
                                    label={this.props.valueLabels[i]}
                                    value={value}
                                    />
                            )
                        })
                    }
                </Picker>
            </Row>
        )
    }
}

@observer
class Row extends PureComponent {
    /* properties:
        label: String
        children: [Component]
    */
    render = () => {
        return (
            <View style={switchStyles.row}>
                <T style={switchStyles.labelText}>
                    {this.props.label}
                </T>
                <View style={switchStyles.switchView}>
                    {this.props.children}
                </View>
            </View>
        )
    }
}
