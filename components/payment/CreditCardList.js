import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '~/components/Component'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { SimpleListView, themedRefreshControl } from '../SimpleListView'
import { Selector, SelectorItem } from '../Selector'
import { Header, HeaderText, TextHeader } from '../Header'
import { CreditCard } from './CreditCard'
import { analytics } from '~/model/analytics'
import { paymentStore } from '~/model/orders/paymentstore'

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
