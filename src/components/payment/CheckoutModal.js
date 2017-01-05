import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '/components/Component'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { OrderTotal } from '../receipt/OrderTotal'
import { LargeButton } from '../Button'
import { CurrentBarPhoto } from '../bar/CurrentBarPhoto'
import { SimpleListView, themedRefreshControl } from '../SimpleListView'
import { OkCancelModal, SmallOkCancelModal } from '../Modals'
import { Selector, SelectorItem } from '../Selector'
import { Header, HeaderText, TextHeader } from '../Header'
import { barStore, orderStore, loginStore, modalStore } from '/model/store'
import { DownloadResultView } from '../download/DownloadResultView'
import { CreditCard } from './CreditCard'
import { ConnectionBar } from '/components/notification/ConnectionBar'
import { downloadManager } from '/network/http'
import { analytics } from '/model/analytics'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

import { AddACardButton } from './AddACardButton'
import { paymentStore } from '/model/orders/paymentstore'
import { PaymentConfigModal } from './PaymentConfigModal'
import { TipComponent, TipRoundButton } from './Tips'

import type { String, Int } from '../Types'

const { log, assert } = _.utils('/components/payment/CheckoutModal')

const styles = StyleSheet.create({
    cardInfo: {
        marginLeft: 5,
        marginRight: 5,
    }
})

@observer
export class CheckoutModal extends DownloadResultView {
    /* properties:
    */

    // askDeliveryModal = null

    @computed get haveCardNumber() {
        return paymentStore.selectedCardNumber != null
    }

    _payNow = () => {
        analytics.trackCheckoutFinish()
        orderStore.placeActiveOrder()
        this.close()
    }

    payNow = () => {
        // orderStore.setFreshOrderToken()
        analytics.trackCheckoutStep(3)
        orderStore.freshOrderToken()
        loginStore.login(
            () => {
                // success
                // if (!orderStore.haveDeliveryMethod)
                    // this.askDeliveryModal.show()
                // else
                this._payNow()
            },
            () => {
                // error
            },
        )
    }

    @action close = () => {
        modalStore.closeCheckoutModal()
        modalStore.openOrderModal()
    }

    cancel = () => {
        this.close()
        analytics.trackCheckoutCancel()
    }

    @computed get disableBuyButton() {
        return (
            !barStore.getBar() ||
            !downloadManager.connected ||
            !orderStore.haveDeliveryMethod
        )
    }

    render = () => {
        if (!modalStore.showCheckoutModal)
            null
        return <OkCancelModal
                    visible={modalStore.showCheckoutModal}
                    showOkButton={this.haveCardNumber}
                    showCancelButton={false}
                    cancelModal={this.close}
                    okModal={this.payNow}
                    okLabel={`Buy Now`}
                    okDisabled={orderStore.getActiveOrderToken() != null || this.disableBuyButton}
                    okDisabledColor='rgba(0, 0, 0, 0.5)'
                    okBackgroundColor='#000'
                    okBorderColor='rgba(0, 0, 0, 0.8)'
                    >
                <CheckoutView onBack={this.cancel} />
        </OkCancelModal>
    }
}

class CheckoutView extends PureComponent {
    /* properties:
        onBack: () => void
    */
    @observable refreshing = false

    getDownloadResult = () => barStore.getBarDownloadResult()

    handleRefresh = async () => {
        this.refreshing = true
        transaction(async () => {
            await barStore.updateBarAndMenu()
            this.refreshing = false
        })
    }

    getRefreshControl = () => {
        return themedRefreshControl({
            refreshing: this.refreshing,
            onRefresh:  this.handleRefresh,
        })
    }

    render = () => {
        return <ScrollView refreshControl={this.getRefreshControl()}>
            <ConnectionBar />
            <CurrentBarPhoto
                onBack={this.props.onBack}
                />
            {/*<TextHeader label="Card" rowHeight={55} style={{marginBottom: 10}} />*/}
            <View style={styles.cardInfo}>
                <SelectedCardInfo />
            </View>
            <TipComponent />
            <OrderTotal
                style={{marginRight: 10}}
                total={orderStore.total + orderStore.tipAmount}
                primary={false}
                /* Do not show tip amount here, it is too noisy */
                /* tip={orderStore.tipAmount} */
                tip={0.0}
                />
            <View style={{height: 55, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10}}>
                <TipRoundButton />
            </View>
        </ScrollView>
    }
}

const dataSource = new ListView.DataSource({
    rowHasChanged: (i, j) => i !== j,
})

@observer
export class SelectedCardInfo extends PureComponent {
    paymentConfigModal = null

    styles = StyleSheet.create({
        view: {
            height: 55,
            alignItems: 'center',
            // borderBottomWidth: 2,
        },
        cardView: {
            // flex: 1,
            width: 350,
            height: 55,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
    })

    trackPress = () => {
        analytics.trackCheckoutStep(2)
    }

    render = () => {
        const card = paymentStore.getSelectedCard()
        if (!card)
            return <AddACardButton
                        style={{marginTop: 0, borderBottomWidth: this.styles.view.borderBottomWidth}}
                        trackPress={this.trackPress} />

        return <View style={this.styles.view}>
            <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => {
                        this.paymentConfigModal.show()
                        this.trackPress()
                    }}>
                <View style={this.styles.cardView}>
                    <PaymentConfigModal
                        ref={ref => this.paymentConfigModal = ref}
                        />
                    <T style={{fontSize: 20, color: '#000'}}>
                        Card:
                    </T>
                    <CreditCard
                        small={true}
                        card={card}
                        />
                </View>
            </TouchableOpacity>
        </View>
    }
}
