import {
    React, Component, View, TouchableOpacity, T, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '~/utils/curry.js'
import { PaymentConfigModal } from '../sidemenu/ControlPanel.js'

const { log, assert } = _.utils('~/components/payment/Checkout.js')

@observer
export class CreditCard extends PureComponent {
    /* properties:
        small: Bool
            whether to show the small version (no remove button etc)
        card: Card
    */

    static defaultProps = {
        small: false,
    }

    render = () => {
        const card = this.props.card
        const textStyle = {fontSize: 20, color: '#000'}
        return <View style={{flex: 1, flexDirection: 'row'}}>
            {!this.props.small && <RemoveCardButton card={this.props.card} />}
            <View style={
                { flex: 1
                , flexDirection: 'row'
                , justifyContent: 'space-around'
                , alignItems: 'center'
                , paddingLeft: 10
                , paddingRight: 10
                }
            }>
                <View style={{alignItems: 'center', minWidth: 60}}>
                    {getCreditCardIcon(this.props.card.cardNumber)}
                </View>
                {/*
                <View style={
                        { justifyContent: 'center'
                        , borderWidth: 1
                        , borderRadius: 5
                        , borderColor: 'rgb(19, 56, 189)'
                        , padding: 5
                        }
                    }>
                    <T style={textStyle}>{card.cardType}</T>
                </View>
                */}
                <View style={{flex: 3, flexDirection: 'row'}}>
                    <T style={{flex: 1, textAlign: 'right', ...textStyle}}>
                        •••• •••• ••••
                        { /*this.props.small
                            ? '••••'
                            : '•••• •••• ••••'
                            */
                        }
                    </T>
                    <T style={{width: 70, ...textStyle, textAlign: 'center'}}>
                        {' ' + card.cardNumber.slice(card.cardNumber.length - 4)}
                    </T>
                </View>
            </View>
        </View>
    }
}
