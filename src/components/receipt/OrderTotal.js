import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { Header, TextHeader, HeaderText } from '../Header.js'
import { LazyBarPhoto } from '../bar/LazyBarPhoto'
import { headerText } from './utils'
import { store, orderStore } from '/model/store.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/receipt/OrderTotal.js')

@observer
export class OrderTotal extends PureComponent {
    /* properties:
        total: Float
        tip:   Float
        style: style object
        primary: bool
            whether to use the primary or secondary theme color
    */

    static defaultProps = {
        primary: true,
    }

    render = () => {
        const tipText   = orderStore.formatPrice(this.props.tip)
        const totalText = orderStore.formatPrice(this.props.total + this.props.tip)
        return <View>
            { this.props.tip > 0.0 &&
                <Header primary={false} rowHeight={30}>
                    <View style={{...this.props.style, flexDirection: 'row'}}>
                        {headerText('Tip:', 18)}
                        {headerText(tipText, 18, 'right')}
                    </View>
                </Header>
            }
            <Header primary={this.props.primary}>
                <View style={{...this.props.style, flexDirection: 'row'}}>
                    {headerText('Total:')}
                    {headerText(totalText, 25, 'right')}
                </View>
            </Header>
        </View>
    }
}
