import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
    T,
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from '../Page.js'
import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { SimpleListView, CombinedDescriptor } from '../SimpleListView.js'
import { MenuItem, createMenuItem } from '../MenuPage.js'
import { LargeButton } from '../Button.js'
import { PaymentModal, CreditCardListDesciptor } from '../Payment/PaymentModal.js'
import { TextHeader } from '../Header.js'
import { OrderList, OrderListDescriptor } from './OrderList.js'
import { ReceiptModal } from './Receipt.js'
import { store, tabStore, barStore, orderStore } from '../Store.js'
import { config } from '../Config.js'

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class OrderPage extends Page {
    @observable ref1 = null
    @observable ref2 = null

    handleOrderPress = () => {
        // orderStore.setPaymentModalVisibility(true)
        orderStore.setFreshOrderToken()
        orderStore.placeActiveOrder()
    }

    renderView = () => {
        if (orderStore.menuItemsOnOrder.length > 0)
            return this.renderOrderList()
        return this.renderEmptyOrder()
    }

    /*** EMPTY ***/
    renderEmptyOrder = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Add Items to Order"
                onPress={() => tabStore.setCurrentTab(2)}
                style={largeButtonStyle}
                />
        </View>
    }

    /*** NONEMPTY ***/
    renderBarPhoto = () => {
        const bar = barStore.getBar()
        return <LazyBarPhoto
                    bar={bar}
                    photo={bar.photos[0]}
                    imageHeight={150} />
    }

    renderOrderList = () => {
        const descs = [
            new CreditCardListDesciptor(),
            new OrderListDescriptor({
                renderHeader: () => <TextHeader label="Items" rowHeight={55} />,
                orderStore: orderStore,
                menuItems:  orderStore.menuItemsOnOrder,
            }),
        ]
        const desc = new CombinedDescriptor(descs, renderHeader = this.renderBarPhoto)
        return <View style={{flex: 1}}>
            <PaymentModal key={'paymentModal' + orderStore.getActiveOrderToken()}/>
            <ReceiptModal key={'receiptModal' + orderStore.getActiveOrderToken()} />
            <SimpleListView descriptor={desc} />
            <OrderButton onPress={this.handleOrderPress} />
        </View>
    }
}

@observer


@observer
class OrderButton extends PureComponent {
    /* properties:
        onPress: () => void
    */
    render = () => {
        if (!orderStore.haveOrders)
            return <View />
        return <LargeButton
                    label={`Buy Now ${orderStore.totalTextWithParens}`}
                    style={largeButtonStyle}
                    onPress={this.props.onPress}
                    /* backgroundColor={config.theme.primary.light} */
                    /* borderColor='rgba(0, 0, 0, 1.0)' */
                    />
    }
}
