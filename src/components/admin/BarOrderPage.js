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

import { IconBar, BarIcon } from '/components/IconBar'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header, TextHeader } from '/components/Header'
import { OrderList, OrderListDescriptor } from '/components/orders/OrderList'
import { Message, SmallOkCancelModal } from '/components/Modals'
import { SimpleOrderList } from '../orders/OrderList'
import { ReceiptHeader } from '../receipt/ReceiptHeader'
import { OrderTotal } from '../receipt/OrderTotal'

import { activeOrderStore } from '/model/store'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/BarOrderPage')

const styles = StyleSheet.create({
    iconBar: {
        flex: 1,
    },
    activeOrder: {
        marginTop: 15,
    },
})

const barOrderIcons = [
    <BarIcon
        key="messages"
        label="active"
        name="glass"
        getCounter={() => activeOrderStore.activeOrderList.length}
        />,
    <BarIcon
        key="completed"
        label="completed"
        name="list"
        />,
]

@observer
export class BarOrderPage extends PureComponent {
    render = () => {
        return (
            <IconBar style={styles.iconBar} icons={barOrderIcons}>
                <ActiveOrderList />
                <View />
            </IconBar>
        )
    }
}

@observer
class ActiveOrderList extends PureComponent {
    render = () => {
        return (
            <ScrollView style={{flex: 1}}>
                <ActiveOrderListDownloadErrors />
                {
                    activeOrderStore.activeOrderList.map((orderResult, i) => {
                        return (
                            <ActiveOrder
                                key={orderResult.orderID}
                                orderResult={orderResult}
                                />
                        )
                    })
                }
            </ScrollView>
        )
    }
}

@observer
class ActiveOrderListDownloadErrors extends DownloadResultView {
    getDownloadResult = activeOrderStore.getActiveOrderFeed
    renderFinished = () => null
}

@observer
class ActiveOrder extends PureComponent {
    /* properties:
        orderResult: OrderResult
    */
    render = () => {
        const orderResult = this.props.orderResult
        return (
            <View style={styles.activeOrder}>
                <ReceiptHeader
                    orderResult={orderResult}
                    />
                <View style={{height: 15}} />
                <SimpleOrderList
                    menuItems={orderResult.menuItems}
                    orderList={orderResult.orderList}
                    />
                <OrderTotal
                    total={orderResult.totalPrice}
                    tip={orderResult.tip}
                    />
            </View>
        )
    }
}
