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
        deliveryText: {
            fontSize: 20,
            color: '#000',
        },
    })

    getDownloadResult = () => barStatusStore.getBarStatusDownload()
    refreshPage = () => barStatusStore.getBarStatusDownload().forceRefresh()

    @action tableDelivery = () => {
        orderStore.delivery = 'Table'
    }

    @action pickup = () => {
        orderStore.delivery = 'Pickup'
    }

    @action setTableNumber = (tableNumber : String) => {
        orderStore.tableNumber = tableNumber
    }

    @action setPickupLocation = (location) => {
        orderStore.pickupLocation = location
    }

    @action toggleButton = (delivery) => {
        orderStore.delivery = delivery
    }

    isActive = (label) => orderStore.delivery === label

    renderLabel = label => {
        if (label === 'Table')
            return 'Table Delivery'
        return 'Pickup'
    }

    renderFinished = () => {
        const tableService = barStatusStore.tableService
        const pickup = barStatusStore.pickupLocationNames.length >= 1
        var delivery = orderStore.delivery
        if (!tableService)
            delivery = 'Pickup'
        if (!pickup && delivery === 'Pickup')
            delivery = null
        const tableNumber =
            orderStore.tableNumber
                ? "" + orderStore.tableNumber
                : ""

        if (!delivery) {
            return <T style={this.styles.deliveryText}>
                No table service or pickup available.
            </T>
        }

        return <View style={this.props.style}>
            <Header style={{flexDirection: 'row' /*, backgroundColor: '#000' */}}
                    primary={this.props.primary}>
                { tableService &&
                    <SelectableButton
                        label='Table'
                        renderLabel={this.renderLabel}
                        onPress={this.tableDelivery}
                        active={this.isActive('Table')}
                        disabled={this.isActive('Table')} /* disable active buttons */
                        style={{flex: 1}}
                        />
                }
                {
                    pickup &&
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
                { delivery === 'Table' &&
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <TextInput
                            keyboardType='phone-pad'
                            style={{marginTop: -10, width: 250, textAlign: 'center'}}
                            placeholder="table number"
                            defaultValue={tableNumber}
                            onChangeText={this.setTableNumber}
                            /* onEndEditing={event => this.setTableNumber(event.nativeEvent.text)} */
                            />
                    </View>
                }
                { delivery === 'Pickup' &&
                    <Picker selectedValue={orderStore.pickupLocation}
                            onValueChange={location => orderStore.pickupLocation = location}
                            style={this.styles.pickerStyle}
                            >
                        {
                            barStatusStore.pickupLocationNames.map(label =>
                                <Picker.Item
                                    key={label}
                                    label={label}
                                    value={label}
                                    />
                            )
                        }
                    </Picker>
                }
            </View>
        </View>
    }
}
