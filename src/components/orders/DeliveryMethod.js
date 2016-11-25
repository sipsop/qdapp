import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
    Switch,
    TextInput,
    T,
    StyleSheet,
    Picker,
    Dimensions,
} from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { SelectableButton } from '/components/ButtonRow'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header } from '/components/Header'

import { store, barStatusStore, orderStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/DeliveryMethod')

@observer
export class DeliveryMethod extends DownloadResultView {
    /* properties:
        primary: Bool
        style: style obj
    */
    @observable value = false
    errorMessage = "Error downloading bar status"

    styles = StyleSheet.create({
        rowStyle: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        optStyle: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 55,
        },
        buttonStyle: {
            flex: 1,
            // height: 55,
            // margin: 5,
        },
        pickerStyle: {
            width: 150,
        },
        serviceNotAvailableText: {
            flex: 1,
            fontSize: 20,
            color: '#000',
            textAlign: 'center',
        },
    })

    getDownloadResult = () => barStatusStore.getBarStatusDownload()
    refreshPage = () => barStatusStore.getBarStatusDownload().forceRefresh()

    @action tableDelivery = () => {
        orderStore.setDelivery('Table')
        orderStore.confirmDeliveryMethod()
    }

    @action pickup = () => {
        orderStore.setDelivery('Pickup')
        orderStore.confirmDeliveryMethod()
    }

    @action setTableNumber = (tableNumber) => {
        orderStore.setDelivery('Table')
        orderStore.setTableNumber(tableNumber)
    }

    @action setPickupLocation = (locationName) => {
        orderStore.setDelivery('Pickup')
        orderStore.setPickupLocation(locationName)
    }

    @action toggleButton = (delivery) => {
        orderStore.setDelivery(delivery)
    }

    renderLabel = label => {
        if (label === 'Table')
            return 'Table Delivery'
        return 'Pickup'
    }

    isActive = (label) => orderStore.defaultDelivery === label

    renderFinished = () => {
        if (!barStatusStore.acceptingOrders) {
            return (
                <T style={this.styles.serviceNotAvailableText}>
                    Sorry, we are not currently accepting orders.
                </T>
            )
        } else if (!barStatusStore.allowOrderPlacing) {
            return (
                <T style={this.styles.serviceNotAvailableText}>
                    No table service or pickup available.
                </T>
            )
        } else {
            assert(orderStore.defaultDelivery != null, "defaultDelivery is null...")
        }

        return <View style={this.props.style}>
            <Header style={{flexDirection: 'row' /*, backgroundColor: '#000' */}}
                    primary={this.props.primary}>
                { barStatusStore.haveTableService &&
                    <SelectableButton
                        label='Table'
                        renderLabel={this.renderLabel}
                        onPress={this.tableDelivery}
                        active={this.isActive('Table')}
                        disabled={this.isActive('Table')} /* disable active buttons */
                        style={{flex: 1}}
                        />
                }
                { barStatusStore.haveOpenPickupLocations &&
                    <SelectableButton
                        label='Pickup'
                        renderLabel={this.renderLabel}
                        onPress={this.pickup}
                        active={this.isActive('Pickup')}
                        disabled={this.isActive('Pickup')} /* disable active buttons */
                        style={{flex: 1}}
                        />
                }
            </Header>
            <View style={this.styles.optStyle}>
                { orderStore.defaultDelivery === 'Table' &&
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <TextInput
                            keyboardType='phone-pad'
                            style={{marginTop: -10, width: 250, textAlign: 'center'}}
                            placeholder="table number"
                            defaultValue={orderStore.defaultTableNumber}
                            onChangeText={this.setTableNumber}
                            />
                    </View>
                }
                { orderStore.defaultDelivery === 'Pickup' &&
                    <Picker selectedValue={orderStore.defaultPickupLocation}
                            onValueChange={this.setPickupLocation}
                            style={this.styles.pickerStyle}
                            >
                        {
                            barStatusStore.openPickupLocations.map(p =>
                                <Picker.Item
                                    key={p.name}
                                    label={p.name}
                                    value={p.name}
                                    />
                            )
                        }
                    </Picker>
                }
            </View>
        </View>
    }
}
