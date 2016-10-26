import { React, Component, PureComponent, T } from './Component.js'
import { orderStore } from '/model/orderstore.js'
import * as _ from '/utils/curry.js'

import { observer } from 'mobx-react/native'

@observer
export class Price extends PureComponent {
    /* properties:
        price: schema.Price
        style: text style
    */
    render = () => {
        const price = this.props.price
        /* TODO: Move formatPrice into this module */
        const priceText = orderStore.formatPrice(price.price, price.currency)
        var prefix = ""
        if (price.option === 'Relative') {
            if (price.price == 0) {
                return <T />
            } else if (price.price < 0) {
                prefix = "- "
            } else {
                prefix = "+ "
            }
        }

        return <T style={this.props.style}>
            {prefix}{priceText}
        </T>
    }

}

export const getCurrencySymbol = (symbol) => {
    if (symbol == 'Sterling') {
        return '£'
    } else if (symbol == 'Euros') {
        return '€'
    } else if (symbol == 'Dollars') {
        return '$'
    } else {
        throw Error('Unknown currency symbol:' + symbol)
    }
}

export const sumPrices = (prices) => {
    return _.sum(prices.map(price => price.price))
}
