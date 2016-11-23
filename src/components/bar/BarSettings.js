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

import { TextHeader } from '../Header.js'

import { store, barStore, barStatusStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/bar/BarSettings')

const styles = StyleSheet.create({
    view: {
        // margin: 5,
        // marginBottom: 10,
        // marginTop: 10,
        // borderTopWidth: 1,
        // borderColor: config.theme.primary.medium,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        color: '#000',
    },
    subText: {
        textAlign: 'center',
        fontSize: 16,
    },
    borderView: {
        flex: 1,
        height: 1,
        // borderBottomWidth: 0.5,
        // marginLeft: 15,
        // marginRight: 15,
        backgroundColor: config.theme.primary.medium,
    },
})

const Border = (props) => <View style={styles.borderView} />

@observer
export class BarSettings extends PureComponent {
    render = () => {
        const isQDodgerBar = true // TODO:
        return (
            <View style={styles.view}>
                <TextHeader
                    label="Admin"
                    rowHeight={55}
                    />
                <AcceptingOrders />
                <Border />
                <TableService />
                <Border />
                <PickupLocations />
                <Border />
                <OpenCloseBar />
                <TextHeader
                    label="Menu"
                    rowHeight={55}
                    />
            </View>
        )
    }
}

@observer
class AcceptingOrders extends PureComponent {
    render = () => {
        return (
            <BarSettingsSwitch
                label="Accepting Orders:"
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
            barSettingsStore.setPickupLocation(value)
        }
    }

    render = () => {
        const locationNames = barStatusStore.pickupLocations.map(
            pickupLocation => pickupLocation.name
        )
        const locationName = barSettingsStore.getPickupLocationName()

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

    render = () => {
        const pickupLocation = barSettingsStore.pickupLocation
        if (!pickupLocation)
            return null
        return (
            <BarSettingsSwitch
                label={`${pickupLocation.name} open:`}
                onPress={this.openOrCloseLocation}
                value={pickupLocation.open}
                />
        )
    }
}

class BarSettingsStore {
    @observable selectedLocationName : String = null

    @computed get pickupLocations() : Map<String, PickupLocation> {
        const result = {}
        barStatusStore.pickupLocations.forEach(pickupLocation => {
            result[pickupLocation.name] = pickupLocation
        })
        return result
    }

    @computed get pickupLocation() {
        return this.pickupLocations[this.getPickupLocationName()]
    }

    getPickupLocationName = () : ?String => {
        const pickupLocations = barStatusStore.pickupLocations
        if (this.selectedLocationName == null && pickupLocations.length) {
            return pickupLocations[0].name
        }
        return this.selectedLocationName
    }

    @action setPickupLocationName = (locationName : String) => {
        this.selectedLocationName = locationName
    }

    /* TODO: getState/setState/emptyState */
}

const barSettingsStore = new BarSettingsStore()


const switchStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        // borderBottomWidth: 0.5,
        // borderColor: config.theme.primary.medium,
        paddingLeft: 10,
        paddingRight: 10,
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
                    style={{width: 150}}
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
