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
} from '~/components/Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from '~/components/Page.js'
import { SimpleListView, CombinedDescriptor, SingletonDescriptor } from '~/components/SimpleListView.js'
import { BarInfoNotification } from '~/components/NotificationBar.js'
import { LargeButton } from '~/components/Button.js'
import { SelectableButton } from '~/components/ButtonRow.js'
import { DownloadResultView } from '~/components/download/DownloadResultView'
import { Checkout, SelectedCardInfo } from '~/components/payment/Checkout.js'
import { Header, TextHeader } from '~/components/Header.js'
import { OrderList, OrderListDescriptor } from '~/components/orders/OrderList.js'
import { Message, SmallOkCancelModal } from '~/components/Modals.js'
import { ReceiptModal } from '~/components/orders/Receipt.js'

import { store, tabStore, barStore, barStatusStore, orderStore, paymentStore } from '~/model/store.js'
import { analytics } from '~/model/analytics.js'
import * as _ from '~/utils/curry.js'
import { config } from '~/utils/config.js'

const { assert, log } = _.utils('./orders/OrderPage.js')

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

const { width } = Dimensions.get('window')

@observer
export class OrderPage extends Page {

    styles = {
        deliveryMethodView: {
            position: 'absolute',
            width: width - 10,
            top: 5,
            left: 5,
        },
        deliveryMethod: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 10,
            height: 120,
            padding: 10,
            borderWidth: 0.5,
            borderColor: config.theme.primary.medium,
        },
        emptyView: {
            width: 1,
            height: 125,
        },
    }

    handleOrderPress = () => {
        orderStore.setCheckoutVisibility(true)
        orderStore.freshCheckoutID()
        analytics.trackCheckoutStart()
    }

    handleRefresh = async () => {
        await barStore.updateMenuInfo(barStore.barID, force = true)
    }

    renderView = () => {
        // if (!barStatusStore.takingOrders)
        //     return <BarInfoNotification />
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
            renderHeader:   () => <View style={this.styles.emptyView} />,
            // renderFooter:   () => <DeliveryMethod primary={false} />,
            orderStore:     orderStore,
            menuItems:      orderStore.menuItemsOnOrder,
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
            {/* Delivery Method. This needs to be at the end to give it a
                higher elevation than the preceding elements.
            */}
            <View style={this.styles.deliveryMethodView}>
                <DeliveryMethod
                    style={this.styles.deliveryMethod}
                    primary={true}
                    />
            </View>
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
    })

    getDownloadResult = () => barStatusStore.getBarStatusDownload()
    refreshPage = () => barStatusStore.refreshBarStatus()

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
        const tableService =
            orderStore.delivery === 'Table' &&
            barStatusStore.tableService
        const pickup =
            orderStore.delivery === 'Pickup' &&
            barStatusStore.pickupLocations.length > 1
        const tableNumber =
            orderStore.tableNumber
                ? "" + orderStore.tableNumber
                : ""

        if (!tableService && !pickup) {
            return null
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
                { tableService &&
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
                { pickup &&
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
