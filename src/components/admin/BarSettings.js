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

import { Loader } from '../Page'
import { Header, HeaderText, TextHeader } from '../Header'
import { Email } from '/components/Email'
import { ConfirmDeliveryModal } from '/components/orders/ConfirmDeliveryModal'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { LargeButton } from '/components/Button'

import { barStore, barStatusStore, barSettingsStore, modalStore } from '/model/store'
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
    barHeaderContents: {
        flexDirection: 'row',
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        color: '#000',
    },
    loader: {
        width: 60,
    },
    borderView: {
        flex: 1,
        height: 1,
        // borderBottomWidth: 0.5,
        // marginLeft: 15,
        // marginRight: 15,
        backgroundColor: config.theme.primary.medium,
    },
    testConfiguration: {
        flex: 1,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButtonStyle: {
        height: 40,
    },
    addRemovePickupLocation: {
        /* Increase button size */
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
    },
})

const Border = (props) => <View style={styles.borderView} />

@observer
export class BarSettings extends PureComponent {
    render = () => {
        const isQDodgerBar = true // TODO:
        return (
            <View style={styles.view}>
                <BarHeader
                    label="Admin"
                    rowHeight={55}
                    />
                <BarSettingsErrors />
                <AcceptingOrders />
                {barStatusStore.acceptingOrders &&
                    <View>
                        <Border />
                        <TableService />
                        <Border />
                        <PickupLocations />
                        {
                            barStatusStore.pickupLocations.map(pickupLocation => {
                                return (
                                    <View key={pickupLocation.name}>
                                        <Border />
                                        <OpenCloseBar
                                            pickupLocation={pickupLocation}
                                            />
                                    </View>
                                )
                            })
                        }
                    </View>
                }
                <Border />
                <TestConfiguration />
                <TextHeader
                    label="Menu"
                    rowHeight={55}
                    />
            </View>
        )
    }
}

@observer
class BarSettingsErrors extends DownloadResultView {
    showRefreshButton = false
    getDownloadResult = () => barStatusStore.updateBarStatusDownload
    renderInProgress = () => null
    renderFinished = () => null
}

@observer
class BarHeader extends PureComponent {
    /* properties:
        label: String
        rowHeight: Int
    */
    render = () => {
        return (
            <Header rowHeight={this.props.rowHeight}>
                <View style={styles.barHeaderContents}>
                    {
                        !barStatusStore.barStatusLoading
                            ? <HeaderText>
                                {this.props.label}
                            </HeaderText>
                            : <Loader color='#fff' />
                    }
                </View>
            </Header>
        )
    }
}

@observer
class AcceptingOrders extends PureComponent {
    render = () => {
        return (
            <BarSettingsSwitch
                label="Accepting Orders:"
                onPress={barStatusStore.setAcceptingOrders}
                value={barStatusStore.acceptingOrders}
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
                onPress={barStatusStore.setTableService}
                value={barStatusStore.tableService}
                />
        )
    }
}

const emailBody = () => `
Hi!

Could you please ADD the following pickup locations?

    ...

Could you please REMOVE the following pickup locations?

    ...

Thanks!
${barStore.barName}
(barID: ${barStore.barID})
`

@observer
class PickupLocations extends PureComponent {
    render = () => {
        return (
            <Row label="Pickup Locations">
                <Email
                    email="support@qdodger.com"
                    subject={`Add/Remove Pickup Locations for ${barStore.barName}`}
                    body={emailBody()}
                    >
                    <T style={styles.addRemovePickupLocation}>
                        Add/Remove
                    </T>
                </Email>
            </Row>
        )
    }


    // render = () => {
    //     const locationNames = barStatusStore.pickupLocationNames
    //     const locationName = barSettingsStore.pickupLocationName
    //
    //     return (
    //         <View>
    //             {/* TODO: */}
    //             {/*<AddPickupLocationModal />*/}
    //             <BarSettingsPicker
    //                 label="Pickup Locations:"
    //                 valueLabels={[...locationNames/*, 'Add New Pickup Location'*/]}
    //                 values={[...locationNames/*, 'AddNew'*/]}
    //                 value={locationName}
    //                 onPress={barSettingsStore.setPickupLocationName}
    //                 />
    //         </View>
    //     )
    // }
}

@observer
class OpenCloseBar extends PureComponent {
    /* properties:
        pickupLocation: PickupLocation
    */

    get pickupLocation() {
        return this.props.pickupLocation
    }

    toggle = () => {
        barStatusStore.setBarOpen(this.pickupLocation.name, !this.pickupLocation.open)
    }

    render = () => {
        return (
            <BarSettingsSwitch
                label={`${this.pickupLocation.name} open:`}
                onPress={this.toggle}
                value={this.pickupLocation.open}
                />
        )
    }
}

@observer
class TestConfiguration extends PureComponent {
    render = () => {
        return (
            <View style={styles.testConfiguration}>
                <LargeButton
                    label={`Test Configuration`}
                    onPress={modalStore.openConfirmDeliveryModal}
                    style={styles.testButtonStyle}
                    prominent={false}
                    textColor={config.theme.primary.medium}
                    /*textColor='#000'*/
                    fontSize={15}
                    /*borderColor='#000'*/
                    borderColor={config.theme.primary.medium}
                    />
            </View>
        )
    }
}

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
        alignItems: 'flex-start',
    },
    switchView: {
        flex: 1,
        alignItems: 'flex-end',
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
        value: T
        onPress: (value : T) => void
    */
    render = () => {
        return (
            <Row label={this.props.label}>
                <Picker
                    style={{width: 150}}
                    selectedValue={this.props.value}
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
