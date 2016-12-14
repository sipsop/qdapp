import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Picker, TextInput } from '/components/Component'
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
    placedOrder: {
        marginBottom: -10,
    },
    selectAll: {
        flex: 1,
        marginTop: 10,
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
    refundReason: {
        alignItems: 'center',
    },
    refundReasonPickerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    refundText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    refundReasonPicker: {
        alignItems: 'center',
        width: 150,
    },
    refundReasonTextInput: {
        width: 240,
        height: 100,
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.50)',
        borderRadius: 10,
        textAlign: 'left',
        textAlignVertical: 'top',
        marginBottom: 15,
    },
})

const border = <View style={styles.border} />

@observer
export class RefundModal extends PureComponent {
    @observable refundButtonPressed = false

    @computed get refundButtonEnabled() {
        return refundStore.refundTotal > 0.0
    }

    @computed get cancelLabel() {
        if (this.refundButtonPressed && refundStore.getRefundOrderDownload().success)
            return "Done"
        return "Cancel"
    }

    @action refund = () => {
        refundStore.deselectAll()
        refundStore.refundNow()
        this.refundButtonPressed = true
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
                cancelLabel={this.cancelLabel}
                cancelModal={refundStore.closeModal}
                >
                <RefundView
                    orderID={refundStore.refundOrderID}
                    />
                <RefundDownloadView />
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
                    style={styles.placedOrder}
                    orderResult={this.orderResult}
                    showRefundOptions={true}
                    />
                {border}
                <SelectAllButton
                    orderResult={this.orderResult}
                    />
                <RefundReason />
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
class RefundDownloadView extends DownloadResultView {
    finishOnLastValue = false
    getDownloadResult = refundStore.getRefundOrderDownload
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
class RefundReason extends PureComponent {
    @observable value = "NA"

    @action setPickerValue = (value) => {
        this.value = value
        if (this.value === "NA") {
            refundStore.setRefundReason("Item(s) not available, sorry.")
        } else {
            refundStore.setRefundReason("")
        }
    }

    render = () => {
        return (
            <View style={styles.refundReason}>
                <View style={styles.refundReasonPickerView}>
                    <T style={styles.refundText}>Reason:</T>
                    <Picker
                        style={styles.refundReasonPicker}
                        selectedValue={this.value}
                        onValueChange={this.setPickerValue}
                        >
                        <Picker.Item
                            label="Not Available"
                            value="NA"
                            />
                        <Picker.Item
                            label="Other"
                            value="Other"
                            />
                    </Picker>
                </View>
                { this.value === "Other" &&
                    <TextInput
                        style={styles.refundReasonTextInput}
                        autoFocus={true}
                        multiline={true}
                        onChangeText={refundStore.setRefundReason}
                        value={refundStore.refundReason}
                        underlineColorAndroid='rgba(255, 255, 255, 0)'
                        />
                }
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
