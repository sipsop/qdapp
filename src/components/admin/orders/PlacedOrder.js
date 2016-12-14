import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { OrderMessages } from './OrderMessages'
import { TextHeader } from '/components/Header'
import { SimpleOrderList } from '/components/orders/SimpleOrderList'

import { activeOrderStore, refundStore } from '/model/store'
import { orderStore, getRefundItems } from '/model/orders/orderstore'
import { formatDate, formatTime } from '/utils/time'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/PlacedOrder')

const styles = StyleSheet.create({
    activeOrder: {
        // marginTop: 15,
    },
    completedOrder: {
        // marginTop: 15,
        // backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    activeOrderHeader: {
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#000',
        marginBottom: 5,
    },
    completedOrderHeader: {
        backgroundColor: '#000',
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
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginLeft: 40,
        marginRight: 40,
    },
    longBorder: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginLeft: 20,
        marginRight: 20,
    },
    separator: {
        height: 2.5,
        backgroundColor: config.theme.primary.medium,
        margin: 15,
        marginLeft: 70,
        marginRight: 70,
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
})


@observer
export class PlacedOrder extends PureComponent {
    /* properties:
        style: style obj
        rowNumber: Int
        orderResult: OrderResult
        showRefundOptions: Bool
            whether the result should include refund buttons (+ and -)
    */

    static defaultProps = {
        rowNumber: 1,
        showActions: true,
        showRefundOptions: false,
    }

    @computed get style() {
        if (!this.props.orderResult.completed) {
            return {
                style: styles.activeOrder,
                headerStyle: styles.activeOrderHeader,
                headerFontColor: '#000',
            }
        } else {
            return {
                style: styles.completedOrder,
                headerStyle: styles.completedOrderHeader,
                headerFontColor: '#fff',
            }
        }
    }

    @computed get normalizedOrderList() {
        return normalizeOrderList(
            this.props.orderResult.orderList,
            this.props.orderResult.refundItems,
        )
    }

    @computed get refundedOrderList() {
        return getRefundedOrderItems(this.props.orderResult)
    }

    render = () => {
        const orderResult = this.props.orderResult
        const tip = orderResult.tip
        const total = orderResult.totalPrice
        const tipText = orderStore.formatPrice(orderResult.tip)
        const totalText = orderStore.formatPrice(total + tip)
        const completed = orderResult.completed

        const submittedTime = formatTime(orderResult.timestamp)
        const submittedDate = formatDate(orderResult.timestamp)
        var completedTime
        var completedDate
        var headerText
        if (orderResult.completed) {
            completedTime = formatTime(orderResult.completedTimestamp)
            completedDate = formatDate(orderResult.completedTimestamp)
            headerText = `Order: #${orderResult.receipt}`
        } else {
            headerText = `Order No. ${this.props.rowNumber}: #${orderResult.receipt}`
        }

        return (
            <View style={[this.style.style, this.props.style]}>
                <TextHeader
                    label={headerText}
                    style={this.style.headerStyle}
                    fontColor={this.style.headerFontColor}
                    />
                <View>
                    <TextRow
                        label="User"
                        text={orderResult.userName}
                        />
                    {
                        orderResult.delivery === 'Table' &&
                            <TextRow
                                label="Table No."
                                text={orderResult.tableNumber}
                                emphasize={true}
                                />
                    }
                    {
                        orderResult.delivery === 'Pickup' &&
                            <TextRow
                                label="Pickup Location"
                                text={orderResult.pickupLocation}
                                emphasize={true}
                                />
                    }
                    {border}
                    <TextRow
                        label={
                            completed
                                ? "Submitted"
                                : "Time"
                        }
                        text={
                            completed
                                ? `${submittedDate} ${submittedTime}`
                                : submittedTime // TODO: Calculate how long ago this was
                        }
                        />
                    {
                        completed &&
                            <TextRow
                                label="Completed"
                                text={`${completedDate} ${completedTime}`}
                                />
                    }
                    {border}
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
                </View>
                <OrderMessages
                    orderResult={orderResult}
                    />
                <SimpleOrderList
                    orderResult={orderResult}
                    showRefundOptions={this.props.showRefundOptions}
                    />
            </View>
        )
    }
}

const border = <View style={styles.border} />
const longBorder = <View style={styles.longBorder} />

@observer
class TextRow extends PureComponent {
    /* properties:
        label: String
        text: String
        emphasize: Bool
        borderBottom: Bool
        borderTop: Bool
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
