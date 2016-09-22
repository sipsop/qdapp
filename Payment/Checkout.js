import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { OrderTotal } from '../Orders/Receipt.js'
import { LargeButton } from '../Button.js'
import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { SimpleListView } from '../SimpleListView.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Header, HeaderText, TextHeader } from '../Header.js'
import { barStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'

import { CardInput, makeAddCardButton } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { getCreditCardIcon } from './CreditCardInfo.js'
import { PaymentConfigModal } from '../ControlPanel.js'
import { TipComponent, TipRoundButton } from './Tips.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Payment/Checkout.js')

@observer
export class Checkout extends PureComponent {
    /* properties:
    */

    styles = StyleSheet.create({

    })

    payNow = () => {
        orderStore.setFreshOrderToken()
        orderStore.placeActiveOrder()
        this.close()
    }

    close = () => {
        orderStore.setCheckoutVisibility(false)
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
                    showOkButton={true}
                    showCancelButton={false}
                    cancelModal={this.close}
                    okModal={this.payNow}
                    okLabel={`Buy Now`}
                    okDisabled={paymentStore.selectedCardNumber == null}
                    okBackgroundColor='#000'
                    okBorderColor='rgba(0, 0, 0, 0.8)'
                    >
                <View style={{flex: 1}}>
                    <LazyBarPhoto
                        bar={bar}
                        photo={bar.photos[0]}
                        imageHeight={150}
                        showBackButton={true}
                        onBack={this.close}
                        />
                    {/*<TextHeader label="Card" rowHeight={55} style={{marginBottom: 10}} />*/}
                    <SelectedCardInfo />
                    <TipComponent style={this.styles.tipSlider} />
                    <OrderTotal
                        style={{marginRight: 10}}
                        total={orderStore.total + orderStore.tipAmount}
                        /* Do not show tip amount here, it is too noisy */
                        /* tip={orderStore.tipAmount} */
                        tip={0.0}
                        />
                    <View style={{height: 55, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10}}>
                        <TipRoundButton />
                    </View>
                </View>
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

    render = () => {
        const haveCard = paymentStore.selectedCardNumber != null
        if (!haveCard)
            return <AddACardButton style={{marginTop: 0, borderBottomWidth: this.styles.view.borderBottomWidth}} />

        return <View style={this.styles.view}>
            <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => this.paymentConfigModal.show()}>
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
            <CardInput label={this.props.label} />
        </View>
    }
}

export class CreditCardListDesciptor {

    @computed get numberOfRows() {
        return paymentStore.cards.length + 1
    }

    renderRow = (i : Int) : Component => {
        if (i < paymentStore.cards.length)
            return this.renderCard(i)
        return <AddACardButton />
    }

    renderCard = (i : Int) => {
        const card = paymentStore.cards[i]
        return <SelectorItem
                    isSelected={() => paymentStore.isSelected(i)}
                    onPress={() => paymentStore.selectCardByOffset(i)}
                    rowNumber={i}
                    >
            <CreditCard key={card.cardNumber} card={card} />
        </SelectorItem>
    }
}

@observer
export class CreditCardList extends PureComponent {
    render = () => {
        return <SimpleListView descriptor={new CreditCardListDesciptor()} />
    }
}

@observer
export class CreditCard extends PureComponent {
    /* properties:
        small: Bool
            whether to show the small version (no remove button etc)
        card: Card
    */

    static defaultProps = {
        small: false,
    }

    render = () => {
        const card = this.props.card
        const textStyle = {fontSize: 20, color: '#000'}
        return <View style={{flex: 1, flexDirection: 'row'}}>
            {!this.props.small && <RemoveCardButton card={this.props.card} />}
            <View style={
                { flex: 1
                , flexDirection: 'row'
                , justifyContent: 'space-around'
                , alignItems: 'center'
                , paddingLeft: 10
                , paddingRight: 10
                }
            }>
                <View style={{alignItems: 'center', minWidth: 60}}>
                    {getCreditCardIcon(this.props.card.cardNumber)}
                </View>
                {/*
                <View style={
                        { justifyContent: 'center'
                        , borderWidth: 1
                        , borderRadius: 5
                        , borderColor: 'rgb(19, 56, 189)'
                        , padding: 5
                        }
                    }>
                    <T style={textStyle}>{card.cardType}</T>
                </View>
                */}
                <View style={{flex: 3, flexDirection: 'row'}}>
                    <T style={{flex: 1, textAlign: 'right', ...textStyle}}>
                        •••• •••• ••••
                        { /*this.props.small
                            ? '••••'
                            : '•••• •••• ••••'
                            */
                        }
                    </T>
                    <T style={{width: 70, ...textStyle, textAlign: 'center'}}>
                        {' ' + card.cardNumber.slice(card.cardNumber.length - 4)}
                    </T>
                </View>
            </View>
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
