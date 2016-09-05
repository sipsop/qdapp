import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { logger } from '../Curry.js'

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


const log = logger('Payment/PaymentStore.sj')

class PaymentStore {
    @observable cards        : Array<Card> = []
    @observable selectedCard : ?Int = null

    getState = () : CardState => {
        return {
            cards:        this.cards,
            selectedCard: this.selectedCard
        }
    }

    @action setState = (cardState : CardState) => {
        this.cards = cardState.cards
        this.selectedCard = cardState.selectedCard
    }

    @action addCard = (card : Card) => {
        for (var i = 0; i < this.cards.length; i++) {
            const existingCard = this.cards[i]
            if (existingCard.cardNumber === card.cardNumber) {
                this.cards[i] = card
                this.selectCard(i)
                return
            }
        }
        log("Pushing card...")
        this.cards.push(card)
        this.selectCard(this.cards.length - 1)
    }

    @action removeCard = (cardNumber : String) => {
        const i = this.findCard(cardNumber)
        if (i !== -1) {
            this.cards.splice(i, 1)
            if (this.selectedCard === i)
                this.deselectCard()
        }
    }

    findCard = (cardNumber : String) : Int => {
        for (var i = 0; i < this.cards.length; i++) {
            if (this.cards[i].cardNumber === cardNumber)
                return i
        }
        return -1
    }

    @action selectCard = (i : Int) => {
        this.selectedCard = i
    }

    @action deselectCard = () => {
        this.selectedCard = null
    }
}

export const paymentStore = new PaymentStore()
