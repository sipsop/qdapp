import Strip from './Stripe.js'
import { DownloadResult, emptyResult } from '../HTTP.js'

/*********************************************************************/

import type { Int, Float, String } from '../Types.js'
import type { Card } from './PaymentStore.js'

export type CardToken = String

/*********************************************************************/

const stripeTestAPIKey = "sk_test_8MKOs1GQ5iKWE5mAi44c36yY"
const stripeAPIKey = stripeTestAPIKey

/*********************************************************************/

// Adapted from https://github.com/xcarpentier/react-native-stripe-api/

export const getStripeToken = (card : Card) : Promise<Token> => {
    return this.stripePostRequest('tokens', {
      'card[number]':       card.cardNumber,
      'card[exp_month]':    card.expiryMonth,
      'card[exp_year]':     card.expiryYear,
      'card[cvc]':          card.cvv,
      'card[address_zip]':  card.postalCode,
    })
}

/**
 * Generic method post to Stripe Rest API
 * @param resource : Rest API ressource ie. tokens, charges, etc.
 * @param properties : object, key by form parm
 */
const stripePostRequest = async (resource: string, properties: Object): Promise => {
    const body = Object.entries(properties)
        .map(([key, value]) => `${key}=${value}`)
        .reduce((previous, current) => `${previous}&${current}`, '')

    var response
    try {
        response = await fetch(
            `${STRIPE_URL}${resource}`,
            { method: 'POST'
            , headers:
                { Accept:         'application/json'
                , Authorization:  `Bearer ${stripeAPIKey}`
                , 'Content-Type': 'application/x-www-form-urlencoded'
                }
            },
            20 * 1000,  // timeout
            body,
        )
    } catch (err) {
        throw new NetworkError(err.mesage)
    }

    const result = await response.json()
    if (response.status !== 200) {
        /* There was some error, return the Stripe API error message */
        throw new NetworkError(result.message)
    }

    /* All good, return Stripe token */
    return result.id
}
