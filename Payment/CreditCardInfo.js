import { React, Component, Icon } from '../Component.js'
import * as _ from '../Curry.js'
import creditCardType from 'credit-card-type'

const { log, assert } = _.utils('./Payment/CreditCardInfo.js')

export const getCreditCardIcon = (creditCardNumber : String) : Component => {
    const cardTypes = creditCardType(creditCardNumber)
    var cardType = 'unknown'
    if (cardTypes && cardTypes.length > 0)
        cardType = cardTypes[0].type

    const size = 40
    switch (cardType) {
        case 'visa':
            return <Icon name='cc-visa' size={size} color='#000' />
        case 'master-card':
            return <Icon name='cc-mastercard' size={size} color='#000' />
        case 'diners-club':
            return <Icon name='cc-diners-club' size={size} color='#000' />
        case 'discover':
            return <Icon name='cc-discover' size={size} color='#000' />
        case 'jcb':
            return <Icon name='cc-jcb' size={size} color='#000' />
        case 'american-express':
        case 'unionpay':
        case 'maestro':
        default:
            return <Icon name='credit-card' size={size} color='#000' />
    }
}