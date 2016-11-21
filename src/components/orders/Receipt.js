import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { downloadManager } from '/network/http'
import { Header, TextHeader, HeaderText } from '../Header.js'
import { DownloadResultView } from '../download/DownloadResultView'
import { CurrentBarPhoto } from '../bar/CurrentBarPhoto'
import { OkCancelModal, SmallOkCancelModal, Message } from '../Modals.js'
import { config } from '/utils/config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Loader } from '../Page.js'
import { MessageList } from '/components/messages/MessageList'
import { store, tabStore, loginStore, orderStatusStore, segment } from '/model/store.js'

import { barStore, orderStore } from '/model/store.js'
import { formatDuration } from '/utils/time'
import * as _ from '/utils/curry.js'

import { SimpleOrderList } from './OrderList.js'
import { paymentStore } from '/model/orders/paymentstore.js'
import { getRefundedItemAmount, isRefundedCompletely } from '/model/orders/orderstore.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/Receipt.js')

@observer
export class ReceiptModal extends PureComponent {
    @observable showConfirmText = false

    confirmCloseModal = null

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    @computed get downloadState() {
        return orderStore.getPlaceOrderDownload().state
    }

    @computed get showCloseButton() {
        return _.includes(['NotStarted', 'Error', 'Finished'], this.downloadState)
    }


    handleClose = () => {
        this.close()
    }

    @action close = () => {
        orderStore.closeReceiptAndResetCart()
        tabStore.setCurrentTab(2)
        this.closeModal()
        segment.track('Receipt Closed')
    }

    @action closeModal = () => {
        orderStore.closeReceipt()
    }

    render = () => {
        if (!this.visible)
            return <View />
        return <OkCancelModal
                    visible={this.visible}
                    showCancelButton={false}
                    showOkButton={this.showCloseButton}
                    okLabel={"Close"}
                    okModal={this.handleClose}
                    cancelModal={this.handleClose}
                    >
            <SmallOkCancelModal
                ref={ref => this.confirmCloseModal = ref}
                message="Did receive your order?"
                onConfirm={this.close}
                okLabel="Yes I Did"
                cancelLabel="Nope  "
                />
            <PlaceOrderDownloadView />
            {
                this.showConfirmText
                    ?    <T style={
                                    { fontSize: 18
                                    , color: '#000'
                                    , textAlign: 'center'
                                    , marginTop: 10
                                    , marginBottom: 10
                                    }
                                }>
                            Close this window?
                        </T>
                    :   undefined
            }
        </OkCancelModal>
    }
}

@observer
export class PlaceOrderDownloadView extends DownloadResultView {
    inProgressMessage = "Processing order..."
    finishOnLastValue = false
    showLastErrorMessage = false
    errorMessage      = "There was an error processing your order"

    getDownloadResult = () => orderStore.getPlaceOrderDownload()

    refreshPage = () => {
        loginStore.login(() => {
            orderStore.placeActiveOrder()
        })
    }

    renderFinished = (_) => {
        const orderResult = this.getDownloadResult().orderResult
        return <Receipt
                    bar={barStore.getBar()}
                    orderResult={orderResult}
                    showEstimate={true} />
    }
}


const headerText = (text, fontSize = 25, textAlign = 'center') => {
    return <HeaderText
                fontSize={fontSize}
                rowHeight={40}
                style={{flex: 1, textAlign: textAlign}}
                >
        {text}
    </HeaderText>
}

@observer
export class Receipt extends PureComponent {
    /* properties:
        bar: Bar
        orderResult: OrderResult
        visible: bool
        onClose: () => void
        showEstimate: bool
        showBackButton: bool
    */

    static defaultProps = {
        showBackButton: false,
    }

    render = () => {
        const bar = this.props.bar
        const orderResult = this.props.orderResult

        assert(orderResult.receipt != null)
        assert(orderResult.userName != null)
        assert(orderResult.orderList != null)

        const deliveryInfo =
            orderResult.delivery === 'Table'
                ? orderResult.tableNumber
                : orderResult.pickupLocation

        // this.updateEstimate()

        return <ScrollView>
            <CurrentBarPhoto
                onBack={this.props.onClose}
                />
            {/*<TextHeader label={'#' + orderResult.receipt} />*/}
            <ReceiptHeader orderResult={orderResult} />
            <Header primary={false} rowHeight={40}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    {headerText(orderResult.delivery + ':', 20)}
                    {headerText(deliveryInfo, 20)}
                </View>
            </Header>
            {
                this.props.showEstimate &&
                    <TimeEstimate orderResult={orderResult}/>
            }
            <MessageLog orderResult={orderResult} />
            <View style={{height: 15, backgroundColor: '#fff'}} />
            <SimpleOrderList
                /* menuItems={orderStore.getMenuItemsOnOrder(orderResult.orderList)} */
                menuItems={orderResult.menuItems}
                orderList={orderResult.orderList}
                />
            <OrderTotal
                total={orderResult.totalPrice}
                tip={orderResult.tip}
                showTipOnly={this.props.showEstimate && orderStore.getAmount(orderResult.orderList) === 1}
                />
        </ScrollView>
    }
}

@observer
class TimeEstimate extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    @computed get orderResult() {
        const orderResult = orderStatusStore.orderResult
        if (orderResult != null &&
                orderResult.orderID === this.props.orderResult.orderID) {
            return orderResult
        }
        return this.props.orderResult
    }

    render = () => {
        const timeEstimate = formatDuration(this.orderResult.estimatedTime)
        return <Header rowHeight={55}>
            <View style={{flexDirection: 'row'}}>
                {headerText('Estimated Time:', 20)}
                {headerText(timeEstimate, 25)}
            </View>
        </Header>
    }
}

@observer
class MessageLog extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    @computed get orderPlacedMessage() {
        return {
            title: "Your order has been placed!",
            message: "Claim your order with this receipt.",
            timestamp: this.props.orderResult.timestamp,
        }
    }

    @computed get refundMessages() {
        return this.props.orderResult.refunds.map(refund => {
            const reason = refund.reason ? `: ${refund.reason}` : ""
            return {
                title: "You got a Refund",
                message: `${getRefundedItemAmount(refund)} items have been refunded${reason}`,
                timestamp: refund.timestamp,
            }
        })
    }

    @computed get completedMessages() {
        const orderResult = this.props.orderResult
        if (!orderResult.completed)
            return []

        if (isRefundedCompletely(orderResult)) {
            return [{
                title: "Order Refunded",
                message: "Your order has been refunded.",
                timestamp: orderResult.completedTimestamp,
            }]
        } else {
            return [{
                title: "Order Completed",
                message: orderResult.delivery === 'Table'
                    ? `Your order will be delivered to your table shortly`
                    : `Your order is available for pickup (at ${orderResult.pickupLocation})`
                    ,
                timestamp: orderResult.completedTimestamp,
            }]
        }
    }

    @computed get messages() {
        return [
            this.orderPlacedMessage,
            ...this.refundMessages,
            ...this.completedMessages,
        ]
    }

    render = () => {
        return (
            <MessageList
                insideScrollView={true}
                getRows={() => this.messages}
                />
        )
        // return <T style={
        //             { fontSize: 18
        //             , color: '#000'
        //             , textAlign: 'center'
        //             , marginTop: 10
        //             , marginBottom: 5
        //             }
        //         }>
        //     Your order has been placed!{'\n'}
        //     Claim your order with this receipt.
        // </T>
    }
}

@observer
class ReceiptHeader extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    receiptModal = null

    render = () => {
        const orderResult = this.props.orderResult
        return <Header>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                        style={{flex: 1}}
                        onPress={() => this.receiptModal.show()}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        {/*headerText(orderResult.userName, 20)*/}
                        {headerText('Receipt No.', 20)}
                        {headerText('#' + orderResult.receipt)}
                    </View>
                </TouchableOpacity>
                <Message
                        ref={ref => this.receiptModal = ref}
                        >
                    <View style={
                            { justifyContent: 'center'
                            , alignItems: 'center'
                            , minHeight: 300
                            }
                        }>
                        <T style={
                                { fontSize: 100
                                , color: config.theme.primary.medium
                                }
                            }>
                            {'#' + orderResult.receipt}
                        </T>
                    </View>
                </Message>
            </View>
        </Header>
    }
}

@observer
export class OrderTotal extends PureComponent {
    /* properties:
        total: Float
        tip:   Float
        style: style object
        primary: bool
            whether to use the primary or secondary theme color
        showTipOnly: Bool
    */

    static defaultProps = {
        primary: true,
        showTipOnly: false,
    }

    render = () => {
        const tipText   = orderStore.formatPrice(this.props.tip)
        const totalText = orderStore.formatPrice(this.props.total + this.props.tip)
        return <View>
            { this.props.tip > 0.0 &&
                <Header primary={false} rowHeight={30}>
                    <View style={{...this.props.style, flexDirection: 'row'}}>
                        {headerText('Tip:', 18)}
                        {headerText(tipText, 18, 'right')}
                    </View>
                </Header>
            }
            { !this.props.showTipOnly &&
                <Header primary={this.props.primary}>
                    <View style={{...this.props.style, flexDirection: 'row'}}>
                        {headerText('Total:')}
                        {headerText(totalText, 25, 'right')}
                    </View>
                </Header>
            }
        </View>
    }
}
