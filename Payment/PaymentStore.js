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
        log("SHOULD I SET THE CARD NUMBER?", this.selectedCardNumber, this.cards.length > 0)
        if (this.selectedCardNumber == null && this.cards.length > 0) {
            log("SETTING CARD NUMBER")
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
