import Strip from './Stripe.js'
import { DownloadResult, emptyResult } from '../HTTP.js'

import type { Int, Float, String } from '../Types.js'
import type { Card } from './PaymentStore.js'

export type CardToken = String

const stripeTestSecretKey = "sk_test_8MKOs1GQ5iKWE5mAi44c36yY"
Stripe.setPublishableKey(stripeTestSecretKey)

export const getStripeToken = (card : Card) : Promise<DownloadResult<Token>> => {
    const responseHandler = (status, response) => {
        if (response.error) {
            reject(response.error.message)
        resolve(response.id)
    }

    return new Promise((resolve, reject) => {
        Stripe.card.createToken({
            number:         card.cardNumber,
            cvc:            card.cvv,
            exp_month:      card.expiryMonth,
            exp_year:       card.expiryYear,
            address_zip:    card.postalCode,
        }, responseHandler)
    })
}
