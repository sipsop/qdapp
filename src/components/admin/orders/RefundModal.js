import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { PlacedOrder } from './PlacedOrder'
import { TextHeader } from '/components/Header'
import { OkCancelModal } from '/components/Modals'
import { OrderStatusView } from '/components/receipt/OrderStatusView'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { LargeButton } from '/components/Button'

import { orderStore, activeOrderStore, refundStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/RefundModal.js')

const styles = StyleSheet.create({
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
    border: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        marginLeft: 40,
        marginRight: 40,
    },
})

const border = <View style={styles.border} />

@observer
export class RefundModal extends PureComponent {
    @computed get refundButtonEnabled() {
        return refundStore.refundTotal > 0.0
    }

    @action refund = () => {
        refundStore.deselectAll()
        activeOrderStore.refundOrder(
            refundStore.refundOrderID,
            refundStore.refundItems,
            refundStore.refundReason,
        )
    }

    render = () => {
        if (!refundStore.refundOrderID)
            return null

        return (
            <OkCancelModal
                visible={true}
                showOkButton={true}
                okLabel="Refund Now"
                okDisabled={!this.refundButtonEnabled}
                okModal={this.refund}
                showCancelButton={true}
                cancelLabel="Cancel"
                cancelModal={refundStore.closeModal}
                >
                <RefundView
                    orderID={refundStore.refundOrderID}
                    />
            </OkCancelModal>
        )
    }
}

@observer
class RefundView extends OrderStatusView {
    /* properties:
        orderID: OrderID
    */

    renderFinished = () => {
        if (!this.orderResult)
            return this.renderInProgress()
        return (
            <ScrollView style={{flex: 1}}>
                <PlacedOrder
                    orderResult={this.orderResult}
                    refund={true}
                    />
                {border}
                <SelectAllButton
                    orderResult={this.orderResult}
                    />
                <RefundTotal />
                <OrderStatusDownloadErrors
                    download={this.getDownloadResult()}
                    />
            </ScrollView>
        )
    }
}

@observer
class OrderStatusDownloadErrors extends DownloadResultView {
    /* properties:
        download: network.http.Download
    */
    finishOnLastValue = false
    getDownloadResult = () => this.props.download
    renderFinished = () => null
}

@observer
class SelectAllButton extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        const props = !refundStore.allItemsRefunded
            ? { label: "Refund All", onPress: refundStore.selectAll }
            : { label: "Refund None", onPress: refundStore.deselectAll }
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
    */
    render = () => {
        const refundTotal = refundStore.refundTotal
        return (
            <TextHeader
                label={`Refund Total: ${orderStore.formatPrice(refundTotal)}`}
                />
        )
    }
}
