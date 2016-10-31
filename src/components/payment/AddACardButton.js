import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    PureComponent, T,
} from '/components/Component'
import { observer } from 'mobx-react/native'

import { paymentStore } from '/model/orders/paymentstore'
import { CardInput } from './CardInput'

@observer
export class AddACardButton extends PureComponent {
    /* properties:
        label: String
        style: style object
        trackPress: ?() => void
    */
    static defaultProps = {
        label: "Add a Card",
    }

    render = () => {
        const addCardStyle =
            paymentStore.cards.length === 0
                ? { marginTop: 5 }
                : { }

        return <View style={{...addCardStyle, ...this.props.style}}>
            <CardInput
                trackPress={this.trackPress}
                label={this.props.label} />
        </View>
    }
}
