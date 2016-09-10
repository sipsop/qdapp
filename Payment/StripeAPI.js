import Strip from './Stripe.js'
import { NetworkError } from '../HTTP.js'
import * as _ from '../Curry.js'

const { log, assert } = _.utils('./Payment/StripeAPI.js')

/*********************************************************************/

import type { Int, Float, String } from '../Types.js'
import type { Card } from './PaymentStore.js'

export type CardToken = String

/*********************************************************************/

const stripeURL = 'https://api.stripe.com/v1/'

const stripeTestAPIKey = "sk_test_8MKOs1GQ5iKWE5mAi44c36yY"
const stripeAPIKey = stripeTestAPIKey

/*********************************************************************/

// Adapted from https://github.com/xcarpentier/react-native-stripe-api/

export const getStripeToken = async (card : Card) : Promise<Token> => {
    return await stripePostRequest('tokens', {
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

    const url = `${stripeURL}${resource}`
    const httpOptions = {
        method: 'POST',
        headers: {
            Accept:         'application/json',
            Authorization:  `Bearer ${stripeAPIKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    }
    var response
    try {
        response = await fetch(url, httpOptions)
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
