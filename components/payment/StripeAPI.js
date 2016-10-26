import { NetworkError } from '../HTTP'
import * as _ from '~/utils/curry'

const { log, assert } = _.utils('./Payment/StripeAPI')

/*********************************************************************/

import type { Int, Float, String } from '../Types'
import type { Card } from '~/model/orders/paymentstore'

export type CardToken = String

/*********************************************************************/

const stripeURL = 'https://api.stripe.com/v1/'

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
    let response
    try {
        response = await fetch(url, httpOptions)
    } catch (err) {
        log('NetworkError', err.message)
        throw new NetworkError(err.mesage)
    }

    const result = await response.json()
    if (response.status !== 200) {
        /* There was some error, return the Stripe API error message */
        log(response.status)
        throw new NetworkError(result.message)
    }

    /* All good, return Stripe token */
    log(result.id)
    return result.id
}
