import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { SimpleListView } from '../SimpleListView.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Header, HeaderText } from '../Header.js'
import { barStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'

import { CardInput } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { getCreditCardIcon } from './CreditCardInfo.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Payment/PaymentModal.js')

@observer
export class PaymentModal extends PureComponent {
    /* properties:
    */

    payNow = () => {
        orderStore.setFreshOrderToken()
        orderStore.placeActiveOrder()
        this.close()
    }

    close = () => {
        orderStore.setPaymentModalVisibility(false)
    }

    render = () => {
        if (!orderStore.paymentModalVisible)
            return <View />

        const textStyle = {
            textAlign: 'center',
        }
        const bar = barStore.getBar()

        return <OkCancelModal
                    visible={orderStore.paymentModalVisible}
                    showOkButton={true}
                    showCancelButton={false}
                    cancelModal={this.close}
                    okModal={this.payNow}
                    okLabel={`Pay Now (${orderStore.totalText})`}
                    okDisabled={paymentStore.selectedCardNumber == null}
                    okBackgroundColor='#000'
                    okBorderColor='rgba(0, 0, 0, 0.8)'
                    >
                <View style={{flex: 1}}>
                    <LazyBarPhoto
                        bar={bar}
                        photo={bar.photos[0]}
                        imageHeight={250}
                        showBackButton={true}
                        onBack={this.close}
                        />
                    {/*
                    <Header>
                        <View style={{flexDirection: 'row'}}>
                            <HeaderText style={{flex: 1, ...textStyle}}>Total:</HeaderText>
                            <HeaderText style={{flex: 1, ...textStyle}}>{orderStore.totalText}</HeaderText>
                        </View>
                    </Header>
                    */}
                    <CreditCardList />
                </View>
        </OkCancelModal>
    }
}


const dataSource = new ListView.DataSource({
    rowHasChanged: (i, j) => i !== j,
})

export class CreditCardListDesciptor {

    @computed get numberOfRows() {
        return paymentStore.cards.length + 1
    }

    renderRow = (i : Int) : Component => {
        if (i < paymentStore.cards.length)
            return this.renderCard(i)
        return this.renderAddButton()
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

    renderAddButton = () => {
        const addCardStyle =
            paymentStore.cards.length === 0
                ? { marginTop: 5 }
                : { }

        return <View style={addCardStyle}>
            <CardInput />
        </View>
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
        card: Card
    */
    render = () => {
        const card = this.props.card
        const textStyle = {fontSize: 20, color: '#000'}
        return <View style={{flex: 1, flexDirection: 'row'}}>
            <RemoveCardButton card={this.props.card} />
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
                    <T style={{flex: 1, textAlign: 'right', ...textStyle}}>•••• •••• •••• </T>
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
