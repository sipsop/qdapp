import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { PlacedOrder } from './PlacedOrder'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { SimpleListView, Descriptor } from '/components/SimpleListView'

import { activeOrderStore, orderFilterStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/ActiveOrders')

const styles = StyleSheet.create({
    separator: {
        height: 2.5,
        backgroundColor: config.theme.primary.medium,
        margin: 15,
        marginLeft: 70,
        marginRight: 70,
    },
})

@observer
export class ActiveOrderList extends PureComponent {
    @computed get descriptor() {
        return new ActiveOrderDescriptor()
    }

    render = () => {
        return (
            <SimpleListView
                descriptor={this.descriptor}
                initialListSize={5}
                pageSize={5}
                />
        )
    }
}

export class ActiveOrderDescriptor extends Descriptor {
    @computed get rows() {
        const orders = orderFilterStore.filterOrders(activeOrderStore.activeOrderList)
        return _.sortBy(orders, 'timestamp')
    }

    rowHasChanged = (ordeResult1, orderResult2) => {
        return true
        // return orderResult1.orderID !== orderResult2.orderID
    }

    renderHeader = () => <ActiveOrderListDownloadErrors />

    refresh = async () => {
        await this.runRefresh(
            () => activeOrderStore.getActiveOrderFeed().forceRefresh()
        )
    }

    renderRow = (orderResult, i) => {
        return (
            <View>
                { i > 0 &&
                    <View style={styles.separator} />
                }
                <PlacedOrder
                    rowNumber={i + 1}
                    orderResult={orderResult}
                    />
            </View>
        )
    }
}

@observer
class ActiveOrderListDownloadErrors extends DownloadResultView {
    getDownloadResult = activeOrderStore.getActiveOrderFeed
    renderFinished = () => null
}
