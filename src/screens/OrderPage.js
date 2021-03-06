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
    Dimensions
} from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page, Loader } from '/components/Page'
import { SimpleListView } from '/components/SimpleListView'
import { LargeButton } from '/components/Button'
import { SelectableButton } from '/components/ButtonRow'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Checkout, SelectedCardInfo } from '/components/payment/Checkout'
import { Header, TextHeader } from '/components/Header'
import { OrderList, OrderListDescriptor } from '/components/orders/OrderList'
import { Message, SmallOkCancelModal } from '/components/Modals'
import { ReceiptModal } from '/components/orders/Receipt'

import { store, tabStore, barStore, barStatusStore, orderStore, paymentStore } from '/model/store'
import { analytics } from '/model/analytics'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('./orders/OrderPage')

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

const { width } = Dimensions.get('window')

@observer
export class OrderPage extends DownloadResultView {

    styles = {
        deliveryMethodView: {
            // position: 'absolute',
            width: width - 10,
            // top: 5,
            // left: 5,
        },
        deliveryMethod: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 10,
            height: 120,
            margin: 5,
            padding: 10,
            borderWidth: 0.5,
            borderColor: config.theme.primary.medium,
        },
        emptyView: {
            width: 1,
            height: 125,
        },
    }

    inProgressMessage = "Loading menu..."
    getDownloadResult = () => barStore.getMenuDownloadResult()

    handleOrderPress = () => {
        orderStore.setCheckoutVisibility(true)
        orderStore.freshCheckoutID()
        analytics.trackCheckoutStart()
    }

    handleRefresh = async () => {
        await Promise.all([
            barStore.getMenuDownloadResult().forceRefresh(),
            barStatusStore.getBarStatusDownload().forceRefresh(),
        ])
    }

    renderFinished = () => {
        if (orderStore.menuItemsOnOrder.length > 0)
            return this.renderOrderList()
        return this.renderEmptyOrder()
    }

    /*** EMPTY ***/
    renderEmptyOrder = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Add Items"
                onPress={() => tabStore.setCurrentTab(2)}
                style={largeButtonStyle}
                />
        </View>
    }

    /*** NONEMPTY ***/
    renderOrderList = () => {
        const descriptor = new OrderListDescriptor({
            renderHeader:   () =>
                <DeliveryMethod
                    style={this.styles.deliveryMethod}
                    primary={true}
                    />,
            // renderFooter:   () => <DeliveryMethod primary={false} />,
            orderStore:     orderStore,
            getMenuItems:   () => orderStore.menuItemsOnOrder,
            visible:        (i) => true,
            showTitle:      true,
            showPrice:      false,
            showHeart:      true,
            onRefresh:      this.handleRefresh,
        })
        return <View style={{flex: 1}}>
            {/* modals */}
            <Checkout key={'checkout' + orderStore.getActiveOrderToken()} />
            <ReceiptModal key={'receiptModal' + orderStore.getActiveOrderToken()} />
            {/* Order stuff */}
            <SimpleListView descriptor={descriptor} />
            <OrderButton onPress={this.handleOrderPress} />
        </View>
    }
}

@observer
class DeliveryMethod extends DownloadResultView {
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
        const pickup = barStatusStore.pickupLocations.length >= 1
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
                            barStatusStore.pickupLocations.map(label =>
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

@observer
class OrderButton extends PureComponent {
    /* properties:
        onPress: () => void
    */

    modal = null

    handlePress = () => {
        if (orderStore.haveDeliveryMethod)
            this.props.onPress()
        else
            this.modal.show()
    }

    render = () => {
        if (!orderStore.haveOrders)
            return <View />
        return <View>
            <AskDeliveryModal
                ref={ref => this.modal = ref}
                onConfirm={this.props.onPress}
                />
            <LargeButton
                label={`Checkout`}
                style={largeButtonStyle}
                onPress={this.handlePress}
                /* backgroundColor={config.theme.primary.light} */
                /* borderColor='rgba(0, 0, 0, 1.0)' */
                />
        </View>
    }
}

@observer
class AskDeliveryModal extends PureComponent {
    /* properties:
        onConfirm: () => void
    */

    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    render = () => {
        {/*
        <Message
            ref={ref => this.modal = ref}
            message="Please enter a table number or pickup location"
            />
        */}
        return <SmallOkCancelModal
                    ref={ref => this.modal = ref}
                    showOkButton={orderStore.haveDeliveryMethod}
                    okLabel={`Checkout`}
                    onConfirm={this.props.onConfirm}
                    >
            <DeliveryMethod />
        </SmallOkCancelModal>
    }
}
