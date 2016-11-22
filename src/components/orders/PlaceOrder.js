import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from '../download/DownloadResultView'
import { OkCancelModal } from '../Modals.js'
import { ConnectionBar } from '/components/notification/ConnectionBar'
import { ReceiptDownload } from './Receipt'
import { barStore, tabStore, orderStore, loginStore, segment } from '/model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/orders/PlaceOrder.js')

@observer
export class PlaceOrderModal extends PureComponent {
    /* Modal for showing a loader while the order is being placed */

    confirmCloseModal = null

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    @computed get downloadState() {
        return orderStore.getPlaceOrderDownload().state
    }

    @computed get showCloseButton() {
        return _.includes(['NotStarted', 'Error', 'Finished'], this.downloadState)
    }

    handleClose = () => {
        log("CLOSING WITH DOWNLOAD STATE", this.downloadState)
        if (this.downloadState === 'Finished')
            this.close()
        else
            this.closeModal()
    }

    @action close = () => {
        orderStore.closeReceiptAndResetCart()
        tabStore.setCurrentTab(2)
        this.closeModal()
        segment.track('Receipt Closed')
    }

    @action closeModal = () => {
        orderStore.closeReceipt()
    }

    render = () => {
        if (!this.visible)
            return null
        return <OkCancelModal
                    visible={this.visible}
                    showCancelButton={false}
                    showOkButton={this.showCloseButton}
                    okLabel={"Close"}
                    okModal={this.handleClose}
                    cancelModal={this.handleClose}
                    >
            <PlaceOrderDownloadView />
        </OkCancelModal>
    }
}

@observer
export class PlaceOrderDownloadView extends DownloadResultView {
    inProgressMessage = "Processing order..."
    finishOnLastValue = false
    showLastErrorMessage = false
    // errorMessage      = "There was an error processing your order"

    getDownloadResult = () => orderStore.getPlaceOrderDownload()

    refreshPage = () => {
        loginStore.login(() => {
            orderStore.placeActiveOrder()
        })
    }

    renderFinished = () => {
        return (
            <ReceiptDownload
                bar={barStore.getBar()}
                orderID={orderStore.orderID}
                />
        )
    }
}
