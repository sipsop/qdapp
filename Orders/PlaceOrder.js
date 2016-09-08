import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { DownloadResultView } from '../HTTP.js'
import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Loader } from '../Page.js'

import { Header, HeaderText } from '../Header.js'
import { barStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'

import { OrderList } from './OrderList.js'
import { paymentStore } from './PaymentStore.js'
import { getStripeToken } from '../Payment/StripeAPI.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Orders/PlaceOrder.js')

@observer
export class PlaceOrder extends DownloadResultView {

    confirmCloseModal = null
    inProgressMessage = "Processing order..."

    @computed get visible() {
        return orderStore.getActiveOrderToken() != null
    }

    handleClose = () => {
        this.confirmCloseModal.show()
    }

    close = () => {
        orderStore.clearOrderList()
    }

    getDownloadResult = () => {
        return orderStore.orderPlacementDownload
    }

    refreshPage = () => {
        orderStore.placeActiveOrder()
    }

    renderNotStarted = () => {
        return <View />
    }

    renderFinished = (orderResult : OrderResult) => {
        const
        return <View>
            <SmallOkCancelModal
                ref={ref => this.confirmCloseModal = ref}
                message="Close this screen?"
                onConfirm={this.close}
                />
            <Receipt
                bar={barStore.getBar()}
                orderResult={orderResult}
                onClose={this.props.handleClose}
                visible={this.visible}
                />
        </View>
    }
}

@observer
class Receipt extends PureComponent {
    /* properties:
        bar: Bar
        orderResult: OrderResult
        visible: bool
        onClose: () => void
    */

    render = () => {
        const bar = this.props.bar
        const orderResult = this.props.orderResult

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
                        imageHeight={250}
                        />
                    <Header>
                        <View style={{flexDirection: 'row'}}>
                            <HeaderText style={{flex: 1, ...textStyle}}>
                                Receipt:
                            </HeaderText>
                            <HeaderText style={{flex: 1, ...textStyle}}>
                                {orderResult.receipt}
                            </HeaderText>
                        </View>
                    </Header>
                    <OrderList orderList={orderResult.orderList} />
                </ScrollView>
        </OkCancelModal>
    }
}
