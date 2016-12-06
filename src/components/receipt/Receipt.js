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
import { IconBar, BarIcon } from '/components/IconBar'
import { OrderTotal } from './OrderTotal'
import { ReceiptHeader } from './ReceiptHeader'
import { headerText } from './utils'

import { formatDuration } from '/utils/time'
import * as _ from '/utils/curry.js'

import { SimpleOrderList } from '../orders/SimpleOrderList'
import { paymentStore } from '/model/orders/paymentstore'
import { getRefundedItemAmount, isRefundedCompletely } from '/model/orders/orderstore'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/Receipt.js')

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

const receiptIcons = [
    <BarIcon
        key="messages"
        Icon={MaterialIcon}
        label="messages"
        name="message"
        />,
    <BarIcon
        key="receipt"
        Icon={MaterialIcon}
        label="receipt"
        name="receipt"
        />,
]

@observer
class ReceiptOptions extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    render = () => {
        const orderResult = this.props.orderResult
        return (
            <IconBar icons={receiptIcons}>
                <MessageLog orderResult={orderResult} />
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
            </IconBar>
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
