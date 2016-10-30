import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent
} from '~/src/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { downloadManager } from '~/src/network/http'
import { Header, TextHeader, HeaderText } from '../Header.js'
import { DownloadResultView } from '../download/DownloadResultView'
import { LazyBarPhoto } from '../bar/LazyBarPhoto'
import { OkCancelModal, SmallOkCancelModal, Message } from '../Modals.js'
import { config } from '~/src/utils/config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Loader } from '../Page.js'
import { store, tabStore, loginStore, segment } from '~/src/model/store.js'

import { barStore, orderStore } from '~/src/model/store.js'
import * as _ from '~/src/utils/curry.js'

import { SimpleOrderList } from './OrderList.js'
import { paymentStore } from '~/src/model/orders/paymentstore.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/Receipt.js')

@observer
export class ReceiptModal extends PureComponent {
    @observable showConfirmText = false

    confirmCloseModal = null

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    @computed get downloadState() {
        return orderStore.getPlaceOrderDownload().state
    }

    @computed get showCloseButton() {
        return _.includes(['NotStarted', 'Error', 'Finished'], this.downloadState)
    }


    handleClose = () => {
        if (_.includes(['NotStarted', 'Error'], this.downloadState)) {
            /* Error submitting, allow closing */
            this.closeModal()
        } else if (this.downloadState === 'Finished') {
            if (Platform.OS === 'android') {
                this.confirmCloseModal.show()
            } else {
                if (this.showConfirmText)
                    this.close() // close double tapped
                else
                    this.showConfirmText = true
            }
        }
    }

    @action close = () => {
        orderStore.closeReceiptAndResetCart()
        tabStore.setCurrentTab(2)
        this.closeModal()
        segment.track('Receipt Closed')
    }

    @action closeModal = () => {
        orderStore.closeReceipt()
    }

    render = () => {
        if (!this.visible)
            return <View />
        return <OkCancelModal
                    visible={this.visible}
                    showCancelButton={false}
                    showOkButton={this.showCloseButton}
                    okLabel={"Close"}
                    okModal={this.handleClose}
                    cancelModal={this.handleClose}
                    >
            <SmallOkCancelModal
                ref={ref => this.confirmCloseModal = ref}
                message="Did receive your order?"
                onConfirm={this.close}
                okLabel="Yes I Did"
                cancelLabel="Nope  "
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
    inProgressMessage = "Processing order..."
    finishOnLastValue = false
    showLastErrorMessage = false
    errorMessage      = "There was an error processing your order"

    getDownloadResult = () => {
        return orderStore.getPlaceOrderDownload()
    }

    refreshPage = () => {
        loginStore.login(() => {
            orderStore.placeActiveOrder()
        })
    }

    renderNotStarted = () => {
        return <View />
    }

    renderFinished = (_) => {
        const orderResult = this.getDownloadResult().orderResult
        return <Receipt
                    bar={barStore.getBar()}
                    orderResult={orderResult}
                    showEstimate={true} />
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
        showBackButton: bool
    */

    static defaultProps = {
        showBackButton: false,
    }

    render = () => {
        const bar = this.props.bar
        const orderResult = this.props.orderResult

        assert (bar.name != null)
        assert(bar.photos != null)
        assert(orderResult.receipt != null)
        assert(orderResult.userName != null)
        assert(orderResult.orderList != null)

        const deliveryInfo =
            orderResult.delivery === 'Table'
                ? orderResult.tableNumber
                : orderResult.pickupLocation

        // this.updateEstimate()

        const timeEstimate = this.props.showEstimate &&
                             renderTime(orderResult.estimatedTime)

        return <ScrollView>
            <LazyBarPhoto
                bar={bar}
                photo={bar.photos[0]}
                imageHeight={140}
                showBackButton={this.props.showBackButton}
                onBack={this.props.onClose}
                />
            {/*<TextHeader label={'#' + orderResult.receipt} />*/}
            <ReceiptHeader orderResult={orderResult} />
            <Header primary={false} rowHeight={40}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    {headerText(orderResult.delivery + ':', 20)}
                    {headerText(deliveryInfo, 20)}
                </View>
            </Header>
            { timeEstimate &&
                <Header rowHeight={40}>
                    <View style={{flexDirection: 'row'}}>
                        {headerText('Estimated Time:', 20)}
                        {headerText(timeEstimate, 20)}
                    </View>
                </Header>
            }
            <Info orderResult={orderResult} />
            <View style={{height: 15, backgroundColor: '#fff'}} />
            <SimpleOrderList
                /* menuItems={orderStore.getMenuItemsOnOrder(orderResult.orderList)} */
                menuItems={orderResult.menuItems}
                orderList={orderResult.orderList}
                />
            <OrderTotal
                total={orderResult.totalPrice}
                tip={orderResult.tip}
                showTipOnly={timeEstimate && orderStore.getAmount(orderResult.orderList) === 1}
                />
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
                    , marginBottom: 5
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
export class OrderTotal extends PureComponent {
    /* properties:
        total: Float
        tip:   Float
        style: style object
        primary: bool
            whether to use the primary or secondary theme color
        showTipOnly: Bool
    */

    static defaultProps = {
        primary: true,
        showTipOnly: false,
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
            { !this.props.showTipOnly &&
                <Header primary={this.props.primary}>
                    <View style={{...this.props.style, flexDirection: 'row'}}>
                        {headerText('Total:')}
                        {headerText(totalText, 25, 'right')}
                    </View>
                </Header>
            }
        </View>
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
