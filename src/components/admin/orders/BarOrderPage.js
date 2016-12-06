import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { ActiveOrderList } from './ActiveOrderList'
import { CompletedOrderList } from './CompletedOrderList'
import { OrderFilter } from './OrderFilter'

import { IconBar, BarIcon } from '/components/IconBar'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header, TextHeader } from '/components/Header'
import { SimpleListView, Descriptor } from '/components/SimpleListView'
import { SmallOkCancelModal } from '/components/Modals'
import { ReceiptHeader } from '/components/receipt/ReceiptHeader'
import { OrderTotal } from '/components/receipt/OrderTotal'

import { orderStore, barStatusStore, activeOrderStore, completedOrderStore, orderFilterStore } from '/model/store'
import { formatDate, formatTime } from '/utils/time'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/BarOrderPage')

const styles = StyleSheet.create({
    iconBar: {
        flex: 1,
        backgroundColor: '#fff',
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
    @observable filterProps = {
        showTableService: true,
        pickupLocation: 'All',
    }

    @action handleSelectionChange = (i) => {
        if (i === 1) {
            /* User selected completed order history */
            completedOrderStore.refresh()
        }
    }

    render = () => {
        return (
            <IconBar
                style={styles.iconBar}
                icons={barOrderIcons}
                onSelectionChange={this.handleSelectionChange}
                >
                <View style={{flex: 1}}>
                    <OrderFilter />
                    <ActiveOrderList />
                </View>
                <View style={{flex: 1}}>
                    <OrderFilter />
                    <CompletedOrderList />
                </View>
            </IconBar>
        )
    }
}
