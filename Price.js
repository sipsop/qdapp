import React, { Component } from 'react';
import { observer } from 'mobx-react/native'

import { T } from './AppText.js'
import * as _ from './Curry.js'

@observer
export class Price extends Component {
    /* properties:
        price: schema.Price
        style: text style
    */
    render = () => {
        const price = this.props.price
        var prefix = ""
        if (price.option == 'Relative') {
            if (price.price == 0.0) {
                return <T />
            } else if (price.price < 0) {
                prefix = "- "
            } else {
                prefix = "+ "
            }
        }

        return <T style={this.props.style}>
            {prefix}{this.getCurrencySymbol(price.currency)}{price.price.toFixed(2)}
        </T>
    }

    getCurrencySymbol = (symbol) => {
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
}

export const sumPrices = (prices) => {
    return _.sum(prices.map(price => price.price))
}
