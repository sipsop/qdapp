import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '../Curry.js'

import type { String, Int } from '../Types.js'

export type Card = {
    cardType:           String,
    cardNumber:         String,
    redactedCardNumber: String,
    expiryMonth:        String,
    expiryYear:         String,
    cvv:                String,
    postalCode:         String,
}

export type CardState = {
    cards:              Array<Card>,
}


const { log, assert } = _.utils('Payment/PaymentStore.sj')

class PaymentStore {
    @observable cards               : Array<Card> = []
    @observable selectedCardNumber  : String = null

    getState = () : CardState => {
        return {
            cards:              this.cards,
            selectedCardNumber: this.selectedCardNumber,
        }
    }

    @action setState = (cardState : CardState) => {
        this.cards = cardState.cards
        this.selectedCardNumber = cardState.selectedCardNumber
    }

    @action addCard = (card : Card) => {
        for (var i = 0; i < this.cards.length; i++) {
            const existingCard = this.cards[i]
            if (existingCard.cardNumber === card.cardNumber) {
                this.cards[i] = card
                this.selectCard(card.cardNumber)
                return
            }
        }
        this.cards.push(card)
        this.selectCard(card.cardNumber)
    }

    @action removeCard = (cardNumber : String) => {
        const i = this.findCard(cardNumber)
        if (i !== -1) {
            this.cards.splice(i, 1)
            if (this.selectedCardNumber === cardNumber)
                this.deselectCard()
        }
        if (this.selectedCardNumber == null && this.cards.length > 0) {
            this.selectCard(this.cards[0].cardNumber)
        }
    }

    findCard = (cardNumber : String) : Int => {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].cardNumber === cardNumber)
                return i
        }
        return -1
    }

    getSelectedCard = () : Card => {
        if (!this.selectedCardNumber)
            throw Error("PaymentStore.js: No card is selected...")
        const i = this.findCard(this.selectedCardNumber)
        return this.cards[i]
    }

    isSelected = (i : Int) => {
        if (i >= this.cards.length)
            return false
        return this.cards[i].cardNumber === this.selectedCardNumber
    }

    @action selectCardByOffset = (i : Int) => {
        this.selectCard(this.cards[i].cardNumber)
    }

    @action selectCard = (cardNumber : String) => {
        this.selectedCardNumber = cardNumber
    }

    @action deselectCard = () => {
        this.selectCard(null)
    }
}

export const paymentStore = new PaymentStore()

const exampleCard = (cardType : String, cardNumber : String) : Card => {
    return {
        cardType:           cardType,
        cardNumber:         cardNumber,
        redactedCardNumber: '•••• •••• •••• ' + cardNumber.slice(cardNumber.length - 4),
        expiryMonth:        8,
        expiryYear:         20,
        cvv:                123,
        postalCode:         '27128',
    }
}

if (_.DEV) {
    const addExample = (cardType, cardNumber) => paymentStore.addCard(exampleCard(cardType, cardNumber))
    setTimeout(() => {
        addExample('Visa',              '4111111111111111')
        addExample('MasterCard', 	    '5500000000000022')
        addExample('American Express', 	'340000000000033')
        // addExample("Diner's Club",      '30000000000044')
        // addExample('Carte Blanche',     '30000000000055')
        // addExample('Discover', 	        '6011000000000066')
        // addExample('en Route', 	        '201400000000077')
        // addExample('JCB', 	            '3088000000000088')
        // addExample('Random',            '27281938383991999')
    }, 3000)
}
