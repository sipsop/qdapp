import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { Header, TextHeader, HeaderText } from '../Header.js'
import { DownloadComponent } from '../download/DownloadComponent'
import { Message } from '../Modals.js'
import { config } from '/utils/config.js'
import { OrderTotal } from './OrderTotal'
import { headerText } from './utils'

import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/receipt/ReceiptHeader.js')

@observer
export class ReceiptHeader extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    receiptNumberModal = null

    render = () => {
        const orderResult = this.props.orderResult
        return <Header>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                        style={{flex: 1}}
                        onPress={() => this.receiptNumberModal.show()}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        {/*headerText(orderResult.userName, 20)*/}
                        {headerText('Receipt No.', 20)}
                        {headerText('#' + orderResult.receipt)}
                    </View>
                </TouchableOpacity>
                <Message
                        ref={ref => this.receiptNumberModal = ref}
                        >
                    <View style={
                            { justifyContent: 'center'
                            , alignItems: 'center'
                            , minHeight: 300
                            }
                        }>
                        <T style={
                                { fontSize: 100
                                , color: config.theme.primary.medium
                                }
                            }>
                            {'#' + orderResult.receipt}
                        </T>
                    </View>
                </Message>
            </View>
        </Header>
    }
}
