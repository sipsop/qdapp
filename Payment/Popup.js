import { React, Component, PureComponent, View, TouchableOpacity, T } from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector } from '../Selector.js'
import { Header } from '../Header.js'
import { orderStore } from '../Orders/OrderStore.js'

import { CardInput } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { logger } from '../Curry.js'

import type { String, Int } from '../Types.js'

const log = logger('Payment/Popup.js')

@observer
export class Popup extends PureComponent {
    /* properties:
        visible: bool
        onClose: () => void
    */
    render = () => {
        const addCardStyle =
            paymentStore.cards.length === 0
                ? { flex: 1, justifyContent: 'center' }
                : {}

        const totalTextStyle = {
            fontSize: 25,
            color: 'black',
            textAlign: 'center',
        }

        return <OkCancelModal
                    visible={this.props.visible}
                    showOkButton={true}
                    cancelModal={this.props.onClose}
                    okModal={this.props.onClose}
                    okLabel="Pay Now"
                    >
            <View style={{flex: 1}}>
                <Header label="Card" />
                <CreditCardList />
                <View style={addCardStyle}>
                    <CardInput />
                </View>
            </View>
            <View style={
                    { flexDirection: 'row'
                    , borderTopWidth: 1
                    , borderBottomWidth: 1
                    }
                }>
                <T style={{flex: 1, ...totalTextStyle}}>Total:</T>
                <T style={{flex: 1, ...totalTextStyle}}>{orderStore.totalText}</T>
            </View>
        </OkCancelModal>
    }
}

@observer
export class CreditCardList extends PureComponent {
    isSelected = (i : Int) => {
        return paymentStore.selectedCard === i
    }

    onSelect = (i : Int) => {
        paymentStore.selectCard(i)
    }

    render = () => {
        return <Selector
                    isSelected={this.isSelected}
                    onSelect={this.onSelect}
                    >
            {
                paymentStore.cards.map(
                    card => <CreditCard key={card.cardNumber} card={card} />
                )
            }
        </Selector>
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
                <T style={textStyle}>{card.redactedCardNumber}</T>
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
        return <View style={
                { justifyContent: 'center'
                , alignItems: 'center'
                , width: 55
                , height: 55
                }
            }>
            <SmallOkCancelModal
                ref={ref => this.modal = ref}
                message="Are you sure you want to remove this card?"
                onConfirm={this.removeCard}
                />
            <TouchableOpacity onPress={() => this.modal.show()}>
                <Icon name="times" size={35} color="rgb(184, 37, 17)" />
            </TouchableOpacity>
        </View>
    }
}
