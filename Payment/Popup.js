import {
    React, Component, View, TouchableOpacity, ScrollView,
    T, PureComponent
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { BarHeader } from '../Bar/BarPage.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector } from '../Selector.js'
import { Header, HeaderText } from '../Header.js'
import { barStore, orderStore } from '../Store.js'
import { logger } from '../Curry.js'

import { CardInput } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { getCreditCardIcon } from './CreditCardInfo.js'

import type { String, Int } from '../Types.js'

const log = logger('Payment/Popup.js')

@observer
export class Popup extends PureComponent {
    /* properties:
        visible: bool
        onClose: () => void
    */
    render = () => {
        const textStyle = {
            textAlign: 'center',
        }

        return <OkCancelModal
                    visible={this.props.visible}
                    showOkButton={true}
                    cancelModal={this.props.onClose}
                    okModal={this.props.onClose}
                    okLabel="Pay Now"
                    >
            <ScrollView>
                <View style={{flex: 1}}>
                    <BarHeader bar={barStore.getBar()} imageHeight={200} />
                    <Header>
                        <View style={{flexDirection: 'row'}}>
                            <HeaderText style={{flex: 1, ...textStyle}}>Total:</HeaderText>
                            <HeaderText style={{flex: 1, ...textStyle}}>{orderStore.totalText}</HeaderText>
                        </View>
                    </Header>
                    <CreditCardList />
                </View>
            </ScrollView>
        </OkCancelModal>
    }
}

@observer
export class CreditCardList extends PureComponent {
    render = () => {
        const addCardStyle =
            paymentStore.cards.length === 0
                ? { flex: 1, justifyContent: 'center' }
                : {}

        return <View>
            <Selector
                    isSelected={paymentStore.isSelected}
                    onSelect={paymentStore.selectCardByOffset}
                    >
                {
                    paymentStore.cards.map(
                        card => <CreditCard key={card.cardNumber} card={card} />
                    )
                }
            </Selector>
            <View style={addCardStyle}>
                <CardInput />
            </View>
        </View>
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
                {getCreditCardIcon(this.props.card.cardNumber)}
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
