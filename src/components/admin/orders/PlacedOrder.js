import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { RefundStore } from '/model/admin/refundstore'
import { TextHeader } from '/components/Header'
import { OkCancelModal, SmallOkCancelModal } from '/components/Modals'
import { SimpleOrderList } from '/components/orders/SimpleOrderList'
import { ActionButtons, ActionButton } from '/components/ActionButtons'
import { LargeButton } from '/components/Button'

import { orderStore, activeOrderStore } from '/model/store'
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
    selectAll: {
        flex: 1,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    selectAllButton: {
        height: 40,
    },
})


@observer
export class PlacedOrder extends PureComponent {
    /* properties:
        rowNumber: Int
        orderResult: OrderResult
        showActions: Bool
            whether to show the Refund and Complete buttons
        refundStore: ?RefundStore
            whether to show refund options
    */

    static defaultProps = {
        rowNumber: 1,
        showActions: true,
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
            <View style={this.style.style}>
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
                <View style={{height: 20}} />
                <SimpleOrderList
                    menuItems={orderResult.menuItems}
                    orderList={orderResult.orderList}
                    refundStore={this.props.refundStore}
                    />
                { this.props.showActions &&
                    <OrderActions orderResult={orderResult} />
                }
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

@observer
class OrderActions extends PureComponent {
    /* properties:
        orderResult: String
    */

    confirmModal = null
    refundModal  = null

    completeOrder = () => {
        activeOrderStore.completeOrder(this.props.orderResult.orderID)
    }

    render = () => {
        return (
            <ActionButtons>
                <SmallOkCancelModal
                    ref={ref => this.confirmModal = ref}
                    message="Complete Order?"
                    onConfirm={this.completeOrder}
                    />
                <RefundModal
                    ref={ref => this.refundModal = ref}
                    orderResult={this.props.orderResult}
                    />
                <ActionButton
                    label="Refund"
                    onPress={() => this.refundModal.show()}
                    />
                {
                    !this.props.orderResult.completed &&
                        <ActionButton
                            label="Complete"
                            onPress={() => this.confirmModal.show()}
                            />
                }
            </ActionButtons>
        )
    }
}

@observer
export class RefundModal extends PureComponent {
    /* properties:
        orderResult: String
    */
    @observable visible = false
    @observable refundStore = null

    @action show = () => {
        this.visible = true
        this.refundStore = new RefundStore(this.props.orderResult.orderList)
    }

    @action close = () => this.visible = false

    @computed get refundButtonEnabled() {
        return this.refundStore.refundTotal > 0.0
    }

    refund = (refundedItems, refundReason) => {
        activeOrderStore.refundOrder(this.props.orderResult.orderID, refundItems, refundReason)
    }

    render = () => {
        if (!this.visible)
            return null

        return (
            <OkCancelModal
                visible={this.visible}
                showOkButton={true}
                okLabel="Refund Now"
                okDisabled={!this.refundButtonEnabled}
                okModal={this.close}
                showCancelButton={true}
                cancelLabel="Cancel"
                cancelModal={this.close}
                >
                <ScrollView style={{flex: 1}}>
                    <PlacedOrder
                        orderResult={this.props.orderResult}
                        showActions={false}
                        refundStore={this.refundStore}
                        />
                    {border}
                    <SelectAllButton
                        orderResult={this.props.orderResult}
                        refundStore={this.refundStore}
                        />
                    {/*
                    {border}
                    <T>OR</T>
                    {border}
                    <RefundAmount
                        refundStore={this.refundStore}
                        />
                    */}
                    <RefundTotal
                        refundStore={this.refundStore}
                        />
                </ScrollView>
            </OkCancelModal>
        )
    }
}

@observer
class SelectAllButton extends PureComponent {
    /* properties:
        orderResult: OrderResult
        refundStore: RefundStore
    */
    selectAll = () => this.props.refundStore.selectAll()
    deselectAll = () => this.props.refundStore.deselectAll()

    render = () => {
        const props = !this.props.refundStore.allItemsRefunded
            ? { label: "Select All", onPress: this.selectAll }
            : { label: "Deselect All", onPress: this.deselectAll }
        return (
            <View style={styles.selectAll}>
                <LargeButton
                    {...props}
                    style={styles.selectAllButton}
                    prominent={false}
                    textColor={config.theme.primary.medium}
                    textColor='#000'
                    borderColor='#000'
                    fontSize={15}
                    borderColor={config.theme.primary.medium}
                    />
            </View>
        )
    }
}

@observer
class RefundTotal extends PureComponent {
    /* properties:
        refundStore: RefundStore
    */

    render = () => {
        const refundTotal = this.props.refundStore.refundTotal
        return (
            <TextHeader
                label={`Refund Total: ${orderStore.formatPrice(refundTotal)}`}
                />
        )
    }
}
