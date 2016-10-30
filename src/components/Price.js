import { React, Component, PureComponent, T } from '~/src/components/Component.js'
import { orderStore } from '~/src/model/orders/orderstore.js'
import * as _ from '~/src/utils/curry.js'

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
        let prefix = ""
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
