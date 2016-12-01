import { React, Component, PureComponent, ScrollView, View, T, StyleSheet, Text } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { IconBar, BarIcon } from '/components/IconBar'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header, TextHeader } from '/components/Header'
import { OrderList, OrderListDescriptor } from '/components/orders/OrderList'
import { Message, SmallOkCancelModal } from '/components/Modals'
import { SimpleOrderList } from '../orders/OrderList'
import { ReceiptHeader } from '../receipt/ReceiptHeader'
import { OrderTotal } from '../receipt/OrderTotal'

import { orderStore, activeOrderStore } from '/model/store'
import { formatTime } from '/utils/time'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/BarOrderPage')

const styles = StyleSheet.create({
    iconBar: {
        flex: 1,
    },
    activeOrder: {
        marginTop: 15,
    },
    activeOrderHeader: {
        backgroundColor: '#000',
        borderBottomWidth: 0.5,
        borderColor: '#fff',
    },
    activeOrderInfoText: {
        fontSize: 18,
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    border: {
        borderBottomWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    rowLabel: {
        fontWeight: 'bold',
    },
    rowText: {
        flex: 1,
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
})

const barOrderIcons = [
    <BarIcon
        key="messages"
        label="active"
        name="glass"
        getCounter={() => activeOrderStore.activeOrderList.length}
        />,
    <BarIcon
        key="completed"
        label="completed"
        name="list"
        />,
]

@observer
export class BarOrderPage extends PureComponent {
    render = () => {
        return (
            <IconBar style={styles.iconBar} icons={barOrderIcons}>
                <ActiveOrderList />
                <View />
            </IconBar>
        )
    }
}

@observer
class ActiveOrderList extends PureComponent {
    render = () => {
        return (
            <ScrollView style={{flex: 1}}>
                <ActiveOrderListDownloadErrors />
                {
                    activeOrderStore.activeOrderList.map((orderResult, i) => {
                        return (
                            <ActiveOrder
                                key={orderResult.orderID}
                                orderResult={orderResult}
                                />
                        )
                    })
                }
            </ScrollView>
        )
    }
}

@observer
class ActiveOrderListDownloadErrors extends DownloadResultView {
    getDownloadResult = activeOrderStore.getActiveOrderFeed
    renderFinished = () => null
}

@observer
class ActiveOrder extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        const orderResult = this.props.orderResult
        const tip = orderResult.tip
        const total = orderResult.totalPrice
        const tipText = orderStore.formatPrice(orderResult.tip)
        const totalText = orderStore.formatPrice(total + tip)
        return (
            <View style={styles.activeOrder}>
                <TextHeader
                    label={`Order No. #${orderResult.receipt}`}
                    style={styles.activeOrderHeader}
                    />
                <View>
                    <TextRow
                        label="User"
                        text={orderResult.userName}
                        />
                    {
                        tip > 0.0 &&
                            <View>
                                <TextRow
                                    label="Tip"
                                    text={tipText}
                                    emphasize={true}
                                    />
                            </View>
                    }
                    <TextRow
                        label="Total"
                        text={totalText}
                        />
                    <TextRow
                        label="Time"
                        text={formatTime(orderResult.timestamp)}
                        />
                </View>
                <View style={{height: 20}} />
                <SimpleOrderList
                    menuItems={orderResult.menuItems}
                    orderList={orderResult.orderList}
                    />
                {/*
                <OrderTotal
                    total={orderResult.totalPrice}
                    tip={orderResult.tip}
                    />
                */}
            </View>
        )
    }
}

const border = <View style={styles.border} />

@observer
class TextRow extends PureComponent {
    /* properties:
        label: String
        text: String
        emphasize: Bool
    */
    render = () => {
        const style = {}
        if (this.props.emphasize)
            style.backgroundColor = config.theme.primary.medium
        else
            style.backgroundColor = '#000'
        return (
            <View style={[styles.textRow, style]}>
                <Text style={[styles.rowText, styles.rowLabel]}>
                    {this.props.label}
                </Text>
                <Text style={styles.rowText}>
                    {this.props.text}
                </Text>
            </View>
        )
    }
}
