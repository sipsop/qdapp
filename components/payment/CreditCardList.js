import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { SimpleListView, themedRefreshControl } from '../SimpleListView.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Header, HeaderText, TextHeader } from '../Header.js'
import { CreditCard } from './CreditCard.js'
import { analytics } from '~/model/analytics.js'
import { paymentStore } from '~/model/paymentstore.js'

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
