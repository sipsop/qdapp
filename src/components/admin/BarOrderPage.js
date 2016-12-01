import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { IconBar, BarIcon } from '/components/IconBar'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header, TextHeader } from '/components/Header'
import { SimpleListView, Descriptor } from '../SimpleListView'
import { SmallOkCancelModal } from '/components/Modals'
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
        backgroundColor: '#fff',
    },
    activeOrder: {
        marginTop: 15,
    },
    activeOrderHeader: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#000',
        marginBottom: 5,
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
        borderColor: 'rgba(0, 0, 0, 0.7)',
    },
    rowLabel: {
        fontWeight: 'bold',
    },
    rowText: {
        flex: 1,
        fontSize: 18,
        color: 'rgba(0, 0, 0, 0.8)',
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
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
            // <ActiveOrderList />
            <IconBar style={styles.iconBar} icons={barOrderIcons}>
                <ActiveOrderList />
                <View />
            </IconBar>
        )
    }
}

@observer
class ActiveOrderList extends PureComponent {
    @computed get descriptor() {
        return new ActiveOrderDescriptor()
    }

    render = () => {
        return (
            <SimpleListView
                descriptor={this.descriptor}
                initialListSize={5}
                pageSize={5}
                />
        )
    }
}

class ActiveOrderDescriptor extends Descriptor {
    @computed get rows() {
        return activeOrderStore.activeOrderList
    }

    rowHasChanged = (ordeResult1, orderResult2) => {
        return true
        // return orderResult1.orderID !== orderResult2.orderID
    }

    renderHeader = () => <ActiveOrderListDownloadErrors />

    refresh = async () => {
        await this.runRefresh(
            () => activeOrderStore.getActiveOrderFeed().forceRefresh()
        )
    }

    renderRow = (orderResult) => <ActiveOrder orderResult={orderResult} />
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
                    fontColor='#000'
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
                <OrderActions
                    orderID={orderResult.orderID}
                    />
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
            style.color = config.theme.primary.medium
        else
            style.color = '#000'
        return (
            <View style={styles.textRow}>
                <Text style={[styles.rowText, styles.rowLabel, style]}>
                    {this.props.label}
                </Text>
                <Text style={[styles.rowText, style]}>
                    {this.props.text}
                </Text>
            </View>
        )
    }
}

@observer
class OrderActions extends PureComponent {
    /* properties:
        orderID: String
    */

    confirmModal = null

    refund = (refundedItems, refundReason) => {
        activeOrderStore.refundOrder(this.props.orderID, refundItems, refundReason)
    }

    completeOrder = () => {
        activeOrderStore.completeOrder(this.props.orderID)
    }

    render = () => {
        return (
            <ButtonRow>
                <SmallOkCancelModal
                    ref={ref => this.confirmModal = ref}
                    message="Complete Order?"
                    onConfirm={this.completeOrder}
                    />
                <Button
                    label="Refund"
                    onPress={this.refund}
                    />
                <Button
                    label="Complete"
                    onPress={() => this.confirmModal.show()}
                    />
            </ButtonRow>
        )
    }
}

@observer
class ButtonRow extends PureComponent {
    render = () => {
        return (
            <Header style={styles.buttonRow}>
                {this.props.children}
            </Header>
        )
    }
}

@observer
class Button extends PureComponent {
    /* properties:
        textStyle: style object
        label: String
        onPress: () => void
    */
    render = () => {
        return (
            <View style={styles.button}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <Text style={[styles.buttonText, this.props.textStyle]}>
                        {this.props.label}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}
