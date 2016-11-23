import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { downloadManager } from '/network/http'
import { Header, TextHeader, HeaderText } from '../Header.js'
import { DownloadResultView } from '../download/DownloadResultView'
import { DownloadComponent } from '../download/DownloadComponent'
import { LazyBarPhoto } from '../bar/LazyBarPhoto'
import { OkCancelModal, SmallOkCancelModal, Message } from '../Modals.js'
import { config } from '/utils/config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Loader } from '../Page.js'
import { MessageList } from '/components/messages/MessageList'
import { OrderStatusDownload } from '/network/api/orders/orderstatus'
import { store, tabStore, loginStore, segment } from '/model/store.js'

import { barStore, orderStore } from '/model/store.js'
import { formatDuration } from '/utils/time'
import * as _ from '/utils/curry.js'

import { SimpleOrderList } from './OrderList.js'
import { paymentStore } from '/model/orders/paymentstore.js'
import { getRefundedItemAmount, isRefundedCompletely } from '/model/orders/orderstore.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/Receipt.js')

@observer
export class ReceiptDownload extends DownloadComponent {
    /* properties:
        bar: Bar
        orderID: OrderID
        onClose: () => void
            called when receipt view is closed
    */

    inProgressMessage = "Retrieving order status..."

    getDownload = () => {
        return new OrderStatusDownload(() => {
            return {
                orderID:   this.props.orderID,
                authToken: loginStore.getAuthToken(),
            }
        })
    }

    @computed get orderResult() {
        return this.getDownloadResult().orderResult
    }

    renderFinished = (_) => {
        if (!this.orderResult) {
            /* TODO: Why is orderResult null sometimes? */
            return this.renderInProgress()
        }
        return (
            <Receipt
                bar={this.props.bar}
                orderResult={this.orderResult}
                onClose={this.props.onClose}
                />
        )
    }
}

@observer
export class Receipt extends PureComponent {
    /* properties:
        bar: Bar
        orderResult: OrderResult
        onClose: () => void
    */

    render = () => {
        const bar = this.props.bar
        const orderResult = this.props.orderResult

        const deliveryInfo =
            orderResult.delivery === 'Table'
                ? orderResult.tableNumber
                : orderResult.pickupLocation

        return (
            <ScrollView>
                <LazyBarPhoto
                    bar={bar}
                    photo={bar.photos[0]}
                    imageHeight={150}
                    showBackButton={this.props.onClose != null}
                    onBack={this.props.onClose}
                    />
                <ReceiptHeader orderResult={orderResult} />
                <ReceiptOptions orderResult={orderResult} />
            </ScrollView>
        )
    }
}

@observer
class TimeEstimate extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        const timeEstimate = formatDuration(this.props.orderResult.estimatedTime)
        return <Header rowHeight={55} primary={false}>
            <View style={{flexDirection: 'row'}}>
                {headerText('Estimated Time:', 20)}
                {headerText(timeEstimate, 25)}
            </View>
        </Header>
    }
}

const styles = StyleSheet.create({
    icons: {
        marginTop: 15,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 70,
    },
    optionIcon: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000',
    },
    iconSubText: {
        flex: 1,
        textAlign: 'center',
    },
})

@observer
class ReceiptOptions extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    @observable messagesVisible = true

    @action setMessagesVisible = (visible : Bool) => {
        this.messagesVisible = visible
    }

    render = () => {
        const orderResult = this.props.orderResult
        const activeIconStyle = {
            borderBottomWidth: 2,
            borderColor: config.theme.primary.medium,
        }
        return (
            <View>
                <View style={styles.icons}>
                    <TouchableOpacity onPress={() => this.setMessagesVisible(true)}>
                        <View>
                            <MaterialIcon
                                name="message"
                                size={60}
                                style={[styles.optionIcon, this.messagesVisible && activeIconStyle]}
                                />
                            <T style={styles.iconSubText}>Messages</T>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setMessagesVisible(false)}>
                        <View>
                            <MaterialIcon
                                name="receipt"
                                size={60}
                                style={[styles.optionIcon, !this.messagesVisible && activeIconStyle]}
                                />
                            <T style={styles.iconSubText}>Receipt</T>
                        </View>
                    </TouchableOpacity>
                </View>
                {this.messagesVisible &&
                    <MessageLog orderResult={orderResult} />
                }
                {!this.messagesVisible &&
                    <View>
                        <View style={{height: 15, backgroundColor: '#fff'}} />
                        <SimpleOrderList
                            menuItems={orderResult.menuItems}
                            orderList={orderResult.orderList}
                            />
                        <OrderTotal
                            total={orderResult.totalPrice}
                            tip={orderResult.tip}
                            />
                    </View>
                }
            </View>
        )
    }
}

@observer
class MessageLog extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    @computed get orderPlacedMessage() {
        var content
        const orderResult = this.props.orderResult
        if (orderResult.delivery === 'Table') {
            content = `It will be delivered to table ${orderResult.tableNumber}.`
        } else {
            content = `You can pick it up later at ${orderResult.pickupLocation}.`
        }
        return {
            title: "Your order has been placed!",
            content: content,
            timestamp: this.props.orderResult.timestamp,
        }
    }

    @computed get refundMessages() {
        return this.props.orderResult.refunds.map(refund => {
            const reason = refund.reason ? `: ${refund.reason}` : ""
            return {
                title: "You got a Refund",
                content: `${getRefundedItemAmount(refund)} items have been refunded${reason}`,
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
                content: "Your order has been refunded.",
                timestamp: orderResult.completedTimestamp,
            }]
        } else {
            return [{
                title: "Order Completed",
                content: orderResult.delivery === 'Table'
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

    receiptNumberModal = null

    render = () => {
        const orderResult = this.props.orderResult
        return <Header>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                        style={{flex: 1}}
                        onPress={() => this.receiptNumberModal.show()}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        {/*headerText(orderResult.userName, 20)*/}
                        {headerText('Receipt No.', 20)}
                        {headerText('#' + orderResult.receipt)}
                    </View>
                </TouchableOpacity>
                <Message
                        ref={ref => this.receiptNumberModal = ref}
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
    */

    static defaultProps = {
        primary: true,
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
            <Header primary={this.props.primary}>
                <View style={{...this.props.style, flexDirection: 'row'}}>
                    {headerText('Total:')}
                    {headerText(totalText, 25, 'right')}
                </View>
            </Header>
        </View>
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
