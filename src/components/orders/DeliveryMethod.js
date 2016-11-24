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
    }

    @action pickup = () => {
        orderStore.setDelivery('Pickup')
        /* Initialize pickup location if not set already */
        if (!orderStore.pickupLocation) {
            const locations = barStatusStore.openPickupLocationNames
            if (locations.length)
                orderStore.setPickupLocation(locations[0])
        }
    }

    @action toggleButton = (delivery) => {
        orderStore.setDelivery(delivery)
    }

    renderLabel = label => {
        if (label === 'Table')
            return 'Table Delivery'
        return 'Pickup'
    }

    @computed get delivery() {
        if (!barStatusStore.haveTableService) {
            return 'Pickup'
        } else if (!barStatusStore.haveOpenPickupLocations) {
            return 'Table'
        }
        return orderStore.delivery
    }

    isActive = (label) => this.delivery === label

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
        }

        const tableNumber = orderStore.tableNumber || ""

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
                { this.delivery === 'Table' &&
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <TextInput
                            keyboardType='phone-pad'
                            style={{marginTop: -10, width: 250, textAlign: 'center'}}
                            placeholder="table number"
                            defaultValue={tableNumber}
                            onChangeText={orderStore.setTableNumber}
                            /* onEndEditing={event => orderStore.setTableNumber(event.nativeEvent.text)} */
                            />
                    </View>
                }
                { this.delivery === 'Pickup' &&
                    <Picker selectedValue={orderStore.pickupLocation}
                            onValueChange={orderStore.setPickupLocation}
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
