import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView, T, Mono, PureComponent, MaterialIcon, StyleSheet } from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { MessageList } from '/components/messages/MessageList'
import { getRefundedItemAmount, isRefundedCompletely } from '/model/orders/orderstore'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/receipt/ReceiptMessages.js')

@observer
export class ReceiptMessages extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    @computed get messages() {
        const orderResult = this.props.orderResult
        const messages = [
            getOrderPlacedMessage(orderResult),
            ...getRefundMessages(orderResult, isUser = true),
        ]
        if (orderResult.completed && !isRefundedCompletely(orderResult))
            messages.push(getCompletedMessage(orderResult))
        return messages
    }

    render = () => {
        return (
            <MessageList
                insideScrollView={true}
                getRows={() => this.messages}
                />
        )
    }
}

export const getOrderPlacedMessage = (orderResult : OrderResult) => {
    var content
    if (orderResult.delivery === 'Table') {
        content = `It will be delivered to table ${orderResult.tableNumber}.`
    } else {
        content = `You can pick it up later at ${orderResult.pickupLocation}.`
    }
    return {
        title: "Your order has been placed!",
        content: content,
        timestamp: orderResult.timestamp,
    }
}

export const getRefundMessages = (orderResult : OrderResult, isUser = true) => {
    const messages = orderResult.refunds.map(refund => {
        const reason = refund.reason ? `: ${refund.reason}` : ""
        return {
            title: "Order Refund",
            content: `${getRefundedItemAmount(refund)} items have been refunded${reason}`,
            timestamp: refund.timestamp,
        }
    })
    if (isRefundedCompletely(orderResult)) {
        messages.push({
            title: "Order Refunded",
            content:
                isUser
                    ? "Your order has been refunded."
                    : "The order has been refunded."
                    ,
            timestamp: orderResult.completedTimestamp,
        })
    }
    return messages
}

export const getCompletedMessage = (orderResult : OrderResult) => {
    return {
        title: "Order Completed",
        content: orderResult.delivery === 'Table'
            ? `Your order will be delivered to your table shortly`
            : `Your order is available for pickup (at ${orderResult.pickupLocation})`
            ,
        timestamp: orderResult.completedTimestamp,
    }
}
