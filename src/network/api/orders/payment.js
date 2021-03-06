import { computed, transaction, action, autorun } from 'mobx'
import { JSONMutation } from '/network/http.js'
import { config } from '/utils/config.js'

/***********************************************************************/
/* Order Placement                                                     */
/***********************************************************************/

export class StripeTokenDownload extends JSONMutation {
    /* properties:
        selectedCard: Card
    */

    name = 'stripe'
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache

    @computed get url() {
        return 'https://api.stripe.com/v1/tokens'
    }

    @computed get card() : Card {
        return this.props.selectedCard
    }

    @computed get httpOptions() {
        const properties = {
          'card[number]':       this.card.cardNumber,
          'card[exp_month]':    this.card.expiryMonth,
          'card[exp_year]':     this.card.expiryYear,
          'card[cvc]':          this.card.cvv,
          'card[address_zip]':  this.card.postalCode,
        }

        const body = Object.entries(properties)
            .map(([key, value]) => `${key}=${value}`)
            .reduce((previous, current) => `${previous}&${current}`, '')

        return {
            method: 'POST',
            headers: {
                Accept:         'application/json',
                Authorization:  `Bearer ${config.stripeAPIKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        }
    }

    /* Result */
    @computed get stripeToken() {
        return this.value && this.value.id
    }
}
