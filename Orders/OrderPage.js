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
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from '../Page.js'
import { SimpleListView, CombinedDescriptor, SingletonDescriptor } from '../SimpleListView.js'
import { MenuItem, createMenuItem } from '../Menu/MenuPage.js'
import { LargeButton } from '../Button.js'
import { SelectableButton } from '../ButtonRow.js'
import { Checkout, SelectedCardInfo } from '../Payment/Checkout.js'
import { Header, TextHeader } from '../Header.js'
import { OrderList, OrderListDescriptor } from './OrderList.js'
import { Message, SmallOkCancelModal } from '../Modals.js'
import { ReceiptModal } from './Receipt.js'
import { store, tabStore, barStore, orderStore, paymentStore } from '../Store.js'
import { config } from '../Config.js'

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class OrderPage extends Page {
    handleOrderPress = () => {
        orderStore.setCheckoutVisibility(true)
        // orderStore.setFreshOrderToken()
        // orderStore.placeActiveOrder()
    }

    handleRefresh = async () => {
        await barStore.updateMenuInfo(barStore.barID, force = true)
    }

    renderView = () => {
        if (orderStore.menuItemsOnOrder.length > 0)
            return this.renderOrderList()
        return this.renderEmptyOrder()
    }

    /*** EMPTY ***/
    renderEmptyOrder = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Add Items to Order"
                onPress={() => tabStore.setCurrentTab(2)}
                style={largeButtonStyle}
                />
        </View>
    }

    /*** NONEMPTY ***/
    renderOrderList = () => {
        const descriptor = new OrderListDescriptor({
            renderHeader:   () => <OrderPageHeader />,
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
            <Checkout key={'checkout' + orderStore.getActiveOrderToken()} />
            <ReceiptModal key={'receiptModal' + orderStore.getActiveOrderToken()} />
            <SimpleListView descriptor={descriptor} />
            <OrderButton onPress={this.handleOrderPress} />
        </View>
    }
}

@observer
class OrderPageHeader extends PureComponent {
    styles = StyleSheet.create({
        deliveryMethod: {
            marginTop: 2,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: '#000',
        }
    })
    render = () => {
        const bar = barStore.getBar()
        return <View>
            <DeliveryMethod primary={true} style={this.styles.deliveryMethod} />
            <TextHeader label="Order" rowHeight={55} primary={false} />
        </View>
    }
}

@observer
class DeliveryMethod extends PureComponent {
    /* properties:
        primary: Bool
        style: style obj
    */
    @observable value = false

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

    static defaultProps = {
        pickupLocations: ['Main Bar', 'First Floor'],
    }

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

    render = () => {
        const tableDelivery = orderStore.delivery === 'Table'
        const pickup = orderStore.delivery === 'Pickup' && this.props.pickupLocations.length > 1
        const showSecondRow = tableDelivery || pickup
        const tableNumber = orderStore.tableNumber
            ? "" + orderStore.tableNumber
            : ""

        return <View style={this.props.style}>
            {/*
            <TextHeader label="Delivery" rowHeight={55} />
            <View>
                <View style={this.styles.rowStyle}>
                    <LargeButton
                        label={`Table Delivery`}
                        onPress={this.tableDelivery}
                        style={this.styles.buttonStyle}
                        prominent={false}
                        textColor='#000'
                        fontSize={20}
                        borderColor='#000' />

                    <LargeButton
                        label={`Pickup`}
                        onPress={this.pickup}
                        style={this.styles.buttonStyle}
                        prominent={false}
                        textColor='#000'
                        fontSize={20}
                        borderColor='#000' />
                </View>
                */}
            <Header style={{flexDirection: 'row' /*, backgroundColor: '#000' */}}
                    primary={this.props.primary}>
                <SelectableButton
                    label='Table'
                    renderLabel={this.renderLabel}
                    onPress={this.tableDelivery}
                    active={this.isActive('Table')}
                    disabled={this.isActive('Table')} /* disable active buttons */
                    style={{flex: 1}}
                    />
                <SelectableButton
                    label='Pickup'
                    renderLabel={this.renderLabel}
                    onPress={this.pickup}
                    active={this.isActive('Pickup')}
                    disabled={this.isActive('Pickup')} /* disable active buttons */
                    style={{flex: 1}}
                    />
            </Header>
            <View style={this.styles.optStyle}>
                { tableDelivery &&
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
                        <Picker.Item label="Main Bar" value="Main Bar" />
                        <Picker.Item label="First Floor" value="First Floor" />
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
