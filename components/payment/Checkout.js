import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { OrderTotal } from '../orders/Receipt.js'
import { LargeButton } from '../Button.js'
import { LazyBarPhoto } from '../bar/BarCard.js'
import { SimpleListView, themedRefreshControl } from '../SimpleListView.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '/utils/config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Header, HeaderText, TextHeader } from '../Header.js'
import { barStore, orderStore, loginStore } from '/model/store.js'
import { CreditCard } from './CreditCard.js'
import { analytics } from '/model/analytics.js'
import * as _ from '/utils/curry.js'

import { CardInput, makeAddCardButton } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { getCreditCardIcon } from './CreditCardInfo.js'
import { PaymentConfigModal } from '../sidemenu/ControlPanel.js'
import { TipComponent, TipRoundButton } from './Tips.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('/components/payment/Checkout.js')

@observer
export class Checkout extends PureComponent {
    /* properties:
    */

    @observable refreshing = false

    @computed get haveCardNumber() {
        return paymentStore.selectedCardNumber != null
    }

    styles = StyleSheet.create({
        cardInfo: {
            marginLeft: 5,
            marginRight: 5,
        }
    })

    payNow = () => {
        // orderStore.setFreshOrderToken()
        analytics.trackCheckoutStep(3)
        loginStore.login(
            () => {
                // success
                analytics.trackCheckoutFinish()
                orderStore.placeActiveOrder()
                this.close()
            },
            () => {
                // error
            },
        )
    }

    close = () => {
        orderStore.setCheckoutVisibility(false)
    }

    cancel = () => {
        this.close()
        analytics.trackCheckoutCancel()
    }

    handleRefresh = async () => {
        this.refreshing = true
        transaction(async () => {
            await barStore.updateBarAndMenu(barStore.barID, force = true)
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
        if (!orderStore.checkoutVisible)
            return <View />

        const textStyle = {
            textAlign: 'center',
        }
        const bar = barStore.getBar()

        return <OkCancelModal
                    visible={orderStore.checkoutVisible}
                    showOkButton={this.haveCardNumber}
                    showCancelButton={false}
                    cancelModal={this.close}
                    okModal={this.payNow}
                    okLabel={`Buy Now`}
                    /* okDisabled={!this.haveCardNumber}
                    okDisabledColor='rgba(0, 0, 0, 0.5)' */
                    okBackgroundColor='#000'
                    okBorderColor='rgba(0, 0, 0, 0.8)'
                    >
                <ScrollView refreshControl={this.getRefreshControl()}>
                    <LazyBarPhoto
                        bar={bar}
                        photo={bar.photos[0]}
                        imageHeight={150}
                        showBackButton={true}
                        onBack={this.cancel}
                        />
                    {/*<TextHeader label="Card" rowHeight={55} style={{marginBottom: 10}} />*/}
                    <View style={this.styles.cardInfo}>
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
        </OkCancelModal>
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
        const haveCard = paymentStore.selectedCardNumber != null
        if (!haveCard)
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
                        card={paymentStore.getSelectedCard()}
                        />
                </View>
            </TouchableOpacity>
        </View>
    }
}


@observer
export class AddACardButton extends PureComponent {
    /* properties:
        label: String
        style: style object
        trackPress: ?() => void
    */
    static defaultProps = {
        label: "Add a Card",
    }

    render = () => {
        const addCardStyle =
            paymentStore.cards.length === 0
                ? { marginTop: 5 }
                : { }

        return <View style={{...addCardStyle, ...this.props.style}}>
            <CardInput
                trackPress={this.trackPress}
                label={this.props.label} />
        </View>
    }
}



@observer
export class RemoveCardButton extends PureComponent {
    /* properties:
        card: Card
    */

    modal = null

    removeCard = () => {
        paymentStore.removeCard(this.props.card.cardNumber)
    }

    render = () => {
        return <View>
            <SmallOkCancelModal
                ref={ref => this.modal = ref}
                message="Are you sure you want to remove this card?"
                onConfirm={this.removeCard}
                />
            <TouchableOpacity onPress={() => this.modal.show()}>
                <View style={
                        { justifyContent: 'center'
                        , alignItems: 'center'
                        , width: 55
                        , height: 55
                        }
                    }>
                    <Icon name="times" size={35} color="rgb(184, 37, 17)" />
                </View>
            </TouchableOpacity>
        </View>
    }
}
