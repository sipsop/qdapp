import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
    Switch,
    TextInput,
    T,
    StyleSheet,
    Picker,
    Dimensions
} from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { SimpleListView } from '/components/SimpleListView'
import { LargeButton } from '/components/Button'
import { TextHeader } from '/components/Header'
import { OrderListDescriptor } from '/components/orders/OrderList'
import { OkCancelModal } from '/components/Modals'
import { DeliveryMethod } from '/components/orders/DeliveryMethod'
import { ConfirmDeliveryModal } from '/components/orders/ConfirmDeliveryModal'
import { ConnectionBar } from '/components/notification/ConnectionBar'
import { CurrentBarPhoto } from '../bar/CurrentBarPhoto'

import { store, tabStore, barStore, barStatusStore, orderStore, paymentStore, loginStore, modalStore } from '/model/store'
import { analytics } from '/model/analytics'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/OrderModal')

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

const { width } = Dimensions.get('window')

@observer
export class OrderModal extends PureComponent {

    @action handleOrderPress = () => {
        orderStore.freshCheckoutID()
        modalStore.openCheckoutModal()
        modalStore.closeOrderModal()
        analytics.trackCheckoutStart()
    }

    render = () => {
        if (!modalStore.showOrderModal)
            null
        return <OkCancelModal
                    visible={modalStore.showOrderModal}
                    showOkButton={true}
                    showCancelButton={false}
                    cancelModal={modalStore.closeOrderModal}
                    okModal={this.handleOrderPress}
                    okLabel="Checkout"
                    >
            <OrderReviewList />
        </OkCancelModal>
    }
}

@observer
class OrderReviewList extends PureComponent {
    simpleListView = null

    @computed get descriptor() {
        return new OrderListDescriptor(
            {
                renderHeader:   () => {
                    return (
                        <View>
                            <ConnectionBar />
                            <TextHeader
                                label="Review Order"
                                onBack={modalStore.closeOrderModal}
                                />
                            {/*
                            <CurrentBarPhoto
                                onBack={modalStore.closeOrderModal}
                                />
                            */}
                        </View>
                    )
                },
                orderStore:     orderStore,
                getMenuItems:   () => orderStore.menuItemsOnOrder,
                visible:        (i) => true,
                showTitle:      true,
                showPrice:      false,
                showHeart:      true,
                onRefresh:      this.handleRefresh,
            },
            () => this.simpleListView,
        )
    }

    render = () => {
        return (
            <SimpleListView
                ref={ref => this.simpleListView = ref}
                descriptor={this.descriptor}
                />
        )
    }
}
