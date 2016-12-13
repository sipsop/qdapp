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
import { ReceiptMessages } from './ReceiptMessages.js'
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

const { log, assert } = _.utils('/components/receipt/Receipt.js')

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
        log("RENDERING RECEIPT OPTIONS", orderResult)
        return (
            <IconBar icons={receiptIcons}>
                <ReceiptMessages orderResult={orderResult} />
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
