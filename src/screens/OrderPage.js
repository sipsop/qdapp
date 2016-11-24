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
import { DeliveryMethod } from '/components/orders/DeliveryMethod'
import { AskDeliveryModal } from '/components/orders/AskDeliveryModal'

import { store, tabStore, barStore, barStatusStore, orderStore, paymentStore } from '/model/store'
import { analytics } from '/model/analytics'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/screens/OrderPage')

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
            renderHeader: () => {
                return (
                    <View>
                        <DeliveryMethod
                            style={this.styles.deliveryMethod}
                            primary={true}
                            />
                    </View>
                )
            },
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
            {/* Order stuff */}
            <SimpleListView descriptor={descriptor} />
            <OrderButton onPress={this.handleOrderPress} />
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
                label="Checkout"
                style={largeButtonStyle}
                onPress={this.handlePress}
                /* backgroundColor={config.theme.primary.light} */
                /* borderColor='rgba(0, 0, 0, 1.0)' */
                />
        </View>
    }
}
