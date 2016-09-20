import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
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

import { SimpleOrderList } from './OrderList.js'
import { paymentStore } from '../Payment/PaymentStore.js'
import { getStripeToken } from '../Payment/StripeAPI.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/Receipt.js')

@observer
export class ReceiptModal extends PureComponent {
    @observable showConfirmText = false

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    handleClose = () => {
        if (Platform.OS === 'android') {
            this.confirmCloseModal.show()
        } else {
            if (this.showConfirmText)
                this.close() // close double tapped
            else
                this.showConfirmText = true
        }
    }

    @action close = () => {
        orderStore.clearOrderList()
        orderStore.clearActiveOrderToken()
        tabStore.setCurrentTab(2)
    }

    render = () => {
        if (!this.visible)
            return <View />
        return <OkCancelModal
                    visible={this.visible}
                    showCancelButton={false}
                    showOkButton={true}
                    okLabel={"Close"}
                    okModal={this.handleClose}
                    cancelModal={this.handleClose}
                    >
            <SmallOkCancelModal
                ref={ref => this.confirmCloseModal = ref}
                message="Did you collect your drinks?"
                onConfirm={this.close}
                okLabel="Yes"
                cancelLabel="Not Yet"
                />
            <PlaceOrderDownloadView />
            {
                this.showConfirmText
                    ?    <T style={
                                    { fontSize: 18
                                    , color: '#000'
                                    , textAlign: 'center'
                                    , marginTop: 10
                                    , marginBottom: 10
                                    }
                                }>
                            Close this window?
                        </T>
                    :   undefined
            }
        </OkCancelModal>
    }
}

@observer
export class PlaceOrderDownloadView extends DownloadResultView {

    confirmCloseModal = null
    inProgressMessage = "Processing order..."
    errorMessage      = "There was an error processing your order"

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
        return <Receipt
                    bar={barStore.getBar()}
                    orderResult={orderResult}
                    showEstimate={true}
                    />
    }
}


const headerText = (text, fontSize = 25, textAlign = 'center') => {
    return <HeaderText
                fontSize={fontSize}
                rowHeight={40}
                style={{flex: 1, textAlign: textAlign}}
                >
        {text}
    </HeaderText>
}

@observer
export class Receipt extends PureComponent {
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

        assert (bar.name != null)
        assert(bar.photos != null)
        assert(orderResult.receipt != null)
        assert(orderResult.userName != null)
        assert(orderResult.orderList != null)

        // this.updateEstimate()

        const timeEstimate = this.props.showEstimate &&
                             renderTime(orderResult.estimatedTime)

        return <ScrollView>
            <LazyBarPhoto
                bar={bar}
                photo={bar.photos[0]}
                imageHeight={150}
                />
            {/*<TextHeader label={'#' + orderResult.receipt} />*/}
            <ReceiptHeader orderResult={orderResult} />
            { timeEstimate &&
                <Header primary={false} rowHeight={40}>
                    <View style={{flexDirection: 'row'}}>
                        {headerText('Estimated Time:', 20)}
                        {headerText(timeEstimate, 20)}
                    </View>
                </Header>
            }
            {/*<OrderTotal orderResult={orderResult} />*/}
            <Info orderResult={orderResult} />
            <View style={{height: 15, backgroundColor: '#fff'}} />
            <SimpleOrderList
                menuItems={orderStore.getMenuItemsOnOrder(orderResult.orderList)}
                orderList={orderResult.orderList}
                />
            <OrderTotal orderResult={orderResult} />
        </ScrollView>
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
            Claim your order with this receipt.
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

@observer
class OrderTotal extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        const orderResult = this.props.orderResult
        // if (orderResult.orderList.length === 1)
        //     return <View />
        const total = orderStore.orderListTotal(orderResult.orderList)
        const totalText = orderStore.formatPrice(total)
        return <Header>
            <View style={{flexDirection: 'row'}}>
                {headerText('Total:')}
                {headerText(totalText, 25, 'right')}
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
