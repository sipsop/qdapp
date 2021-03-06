import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '/components/Component'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { SimpleListView, themedRefreshControl } from '../SimpleListView'
import { Selector, SelectorItem } from '../Selector'
import { Header, HeaderText, TextHeader } from '../Header'
import { CreditCard } from './CreditCard'
import { AddACardButton } from './AddACardButton'
import { analytics } from '/model/analytics'
import { paymentStore } from '/model/orders/paymentstore'

export class CreditCardListDesciptor {

    @computed get rows() : Array<Card> {
        return paymentStore.cards
    }

    rowHasChanged = (card1 : Card, card2 : Card) => {
        return card1.cardNumber !== card2.cardNumber
    }

    renderRow = (card : Card, i : Int) : Component => {
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
        return <View>
            <SimpleListView descriptor={new CreditCardListDesciptor()} />
            <AddACardButton />
        </View>
    }
}
