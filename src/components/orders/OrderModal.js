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

import { SimpleListView, Descriptor } from '/components/SimpleListView'
import { TextHeader } from '/components/Header'
import { TextMenuItem } from '../menu/TextMenuItem'
// import { OrderListDescriptor } from '/components/orders/OrderList'
import { OkCancelModal } from '/components/Modals'
import { ConnectionBar } from '/components/notification/ConnectionBar'
// import { CurrentBarPhoto } from '../bar/CurrentBarPhoto'

import { store, tabStore, barStore, barStatusStore, orderStore, paymentStore, loginStore, modalStore } from '/model/store'
import { analytics } from '/model/analytics'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/OrderModal')

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

class TextOrderListDescriptor extends Descriptor {
    @computed get rows() {
        return orderStore.menuItemsOnOrder
    }

    rowHasChanged = (menuItem1, menuItem2) => {
        return menuItem1.id !== menuItem2.id
    }

    renderRow = (menuItem, i) => {
        return (
            <TextMenuItem
                rowNumber={i}
                menuItem={menuItem}
                orderStore={orderStore}
                />
        )
    }
}

const textOrderListDescriptor = new TextOrderListDescriptor()

@observer
class OrderReviewList extends PureComponent {
    // simpleListView = null

    // @computed get descriptor() {
    //     return new OrderListDescriptor(
    //         {
    //             orderStore:     orderStore,
    //             getMenuItems:   () => orderStore.menuItemsOnOrder,
    //             visible:        (i) => true,
    //             showTitle:      true,
    //             showPrice:      false,
    //             showHeart:      false,
    //             onRefresh:      this.handleRefresh,
    //         },
    //         () => this.simpleListView,
    //     )
    // }

    render = () => {
        return (
            <View style={{flex: 1}}>
                <ConnectionBar />
                <TextHeader
                    label="Review Order"
                    onBack={modalStore.closeOrderModal}
                    />
                <SimpleListView
                    descriptor={textOrderListDescriptor}
                    />
            </View>
        )
    }
}
