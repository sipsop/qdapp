import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { OrderMessages } from './OrderMessages'
import { PlacedOrder } from './PlacedOrder'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { ActionButtons, ActionButton } from '/components/ActionButtons'
import { SmallOkCancelModal } from '/components/Modals'
import { SimpleListView, Descriptor } from '/components/SimpleListView'

import { activeOrderStore, orderFilterStore, refundStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/ActiveOrders.js')

const styles = StyleSheet.create({
    separator: {
        height: 2.5,
        backgroundColor: config.theme.primary.medium,
        margin: 15,
        marginLeft: 70,
        marginRight: 70,
    },
})

@observer
export class ActiveOrderList extends PureComponent {
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

export class ActiveOrderDescriptor extends Descriptor {
    @computed get rows() {
        const orders = orderFilterStore.filterOrders(activeOrderStore.activeOrderList)
        return _.sortBy(orders, 'timestamp')
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

    renderRow = (orderResult, i) => {
        return (
            <View>
                { i > 0 &&
                    <View style={styles.separator} />
                }
                <PlacedOrder
                    rowNumber={i + 1}
                    orderResult={orderResult}
                    />
                <OrderMessages orderResult={orderResult} />
                <OrderActions orderResult={orderResult} />
            </View>
        )
    }
}

@observer
class ActiveOrderListDownloadErrors extends DownloadResultView {
    getDownloadResult = activeOrderStore.getActiveOrderFeed
    renderFinished = () => null
}

@observer
class OrderActions extends PureComponent {
    /* properties:
        orderResult: String
    */

    confirmModal = null

    completeOrder = () => {
        activeOrderStore.completeOrder(this.props.orderResult.orderID)
    }

    refundOrder = () => {
        refundStore.showModal(this.props.orderResult)
    }

    render = () => {
        const orderResult = this.props.orderResult
        return (
            <ActionButtons>
                <SmallOkCancelModal
                    ref={ref => this.confirmModal = ref}
                    message="Complete Order?"
                    onConfirm={this.completeOrder}
                    />
                <ActionButton
                    label="Refund"
                    onPress={this.refundOrder}
                    />
                {
                    !orderResult.completed &&
                        <ActionButton
                            label="Complete"
                            onPress={() => this.confirmModal.show()}
                            />
                }
            </ActionButtons>
        )
    }
}
