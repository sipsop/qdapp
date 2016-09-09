import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { Header, TextHeader, HeaderText } from '../Header.js'
import { DownloadResultView } from '../HTTP.js'
import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { OkCancelModal, SmallOkCancelModal, Message } from '../Modals.js'
import { config } from '../Config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Loader } from '../Page.js'
import { store, tabStore } from '../Store.js'

import { barStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'

import { OrderList } from './OrderList.js'
import { paymentStore } from '../Payment/PaymentStore.js'
import { getStripeToken } from '../Payment/StripeAPI.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/PlaceOrder.js')

@observer
export class PlaceOrderModal extends DownloadResultView {

    confirmCloseModal = null
    inProgressMessage = "Processing order..."

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    handleClose = () => {
        this.confirmCloseModal.show()
    }

    @action close = () => {
        orderStore.clearOrderList()
        tabStore.setCurrentTab(2)
    }

    getDownloadResult = () => {
        return orderStore.getOrderResultDownload()
    }

    refreshPage = () => {
        orderStore.placeActiveOrder()
    }

    renderNotStarted = () => {
        return <View />
    }

    renderFinished = (orderResult : OrderResult) => {
        return <View>
            <SmallOkCancelModal
                ref={ref => this.confirmCloseModal = ref}
                message="Close this screen?"
                onConfirm={this.close}
                />
            <Receipt
                bar={barStore.getBar()}
                orderResult={orderResult}
                onClose={this.handleClose}
                visible={this.visible}
                showEstimate={true}
                />
        </View>
    }
}


const headerText = (text, fontSize = 25) => {
    return <HeaderText
                fontSize={fontSize}
                rowHeight={40}
                style={{flex: 1, textAlign: 'center'}}
                >
        {text}
    </HeaderText>
}

@observer
class Receipt extends PureComponent {
    /* properties:
        bar: Bar
        orderResult: OrderResult
        visible: bool
        onClose: () => void
        showEstimate: bool
    */

    render = () => {
        const bar = this.props.bar
        const orderResult = this.props.orderResult

        // this.updateEstimate()

        const timeEstimate =
            this.props.showEstimate
                ? renderTime(orderResult.estimatedTime)
                : null

        return <OkCancelModal
                    visible={this.props.visible}
                    showCancelButton={false}
                    showOkButton={true}
                    okLabel={"Close"}
                    okModal={this.props.onClose}
                    cancelModal={this.props.onClose}
                    >
                <ScrollView>
                    <LazyBarPhoto
                        bar={bar}
                        photo={bar.photos[0]}
                        imageHeight={150}
                        />
                    {/*<TextHeader label={'#' + orderResult.receipt} />*/}
                    <ReceiptHeader orderResult={orderResult} />
                    { timeEstimate
                        ? <Header primary={false} rowHeight={40}>
                            <View style={{flexDirection: 'row'}}>
                                {headerText('Estimated Time:', 20)}
                                {headerText(timeEstimate, 20)}
                            </View>
                          </Header>
                        : undefined
                    }
                    <Info orderResult={orderResult} />
                    <OrderList
                        orderList={orderResult.orderList}
                        simple={true}
                        />
                </ScrollView>
        </OkCancelModal>
    }
}

@observer
class Info extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        return <T style={
                    { fontSize: 18
                    , color: '#000'
                    , textAlign: 'center'
                    , marginTop: 10
                    , marginBottom: 10
                    }
                }>
            Your order has been placed!{'\n'}
            Show this page to claim your order.
        </T>
    }
}

@observer
class ReceiptHeader extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */

    receiptModal = null

    render = () => {
        const orderResult = this.props.orderResult

        return <Header>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                        style={{flex: 1}}
                        onPress={() => this.receiptModal.show()}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        {headerText(orderResult.userName, 20)}
                        {headerText('#' + orderResult.receipt)}
                    </View>
                </TouchableOpacity>
                <Message
                        ref={ref => this.receiptModal = ref}
                        >
                    <View style={
                            { justifyContent: 'center'
                            , alignItems: 'center'
                            , minHeight: 300
                            }
                        }>
                        {/*
                        <T style={
                                { fontSize: 60
                                , numberOfLines: 1
                                , color: config.theme.primary.medium
                                }
                            }>
                            {orderResult.userName}
                        </T>
                        */}
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

const renderTime = (time : Float) => {
    if (time < 10)
        return "Any time now..."
    const seconds = renderNumber(time % 60)
    const minutes = renderNumber(Math.floor(time / 60))
    const hours   = renderNumber(Math.floor(time / 3600))
    if (hours)
        return `${hours}:${minutes}:${seconds}`
    if (minutes)
        return `${minutes}:${seconds}`
    return `${seconds}s`
}

const renderNumber = (n : Int) => {
    if (n < 10)
        return '0' + n
    return '' + n
}
