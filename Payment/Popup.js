import { React, Component, PureComponent, View, TouchableOpacity } from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { T } from '../AppText.js'
import { OkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector } from '../Selector.js'

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

        return <OkCancelModal
                    visible={this.props.visible}
                    showOkButton={true}
                    cancelModal={this.props.onClose}
                    okModal={this.props.onClose}
                    >
            <View style={{flex: 1}}>
                <Header label="Choose a Card" />
                <CreditCardList />
                <View style={addCardStyle}>
                    <CardInput />
                </View>
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
        log("rendering card list...", paymentStore.cards)
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
                <T style={textStyle}>{card.cardType}</T>
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
            <TouchableOpacity onPress={this.removeCard}>
                <Icon name="times" size={35} color="rgb(184, 37, 17)" />
            </TouchableOpacity>
        </View>
    }
}

@observer
class Header extends PureComponent {
    /* properties:
        label: String
    */
    render = () => {
        const backgroundColor = config.theme.primary.medium
        const rowHeight = 55
        return (
            <View style={
                    { justifyContent: 'center'
                    , alignItems: 'center'
                    , backgroundColor: backgroundColor
                    , height: rowHeight
                    }
                }>
                <T style={
                        { fontSize: 25
                        , color: '#fff'
                        , textDecorationLine: 'underline'
                        , marginLeft: 5
                        }
                    }>
                    {this.props.label}
                </T>
            </View>
        )
    }
}
