import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView, T, Mono, PureComponent, MaterialIcon, StyleSheet } from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { MessageList } from '/components/messages/MessageList'
import { getRefundMessages } from '/components/receipt/ReceiptMessages.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/admin/orders/OrderMessages.js')

@observer
export class OrderMessages extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    @computed get messages() {
        const orderResult = this.props.orderResult
        return getRefundMessages(orderResult, isUser = false)
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
