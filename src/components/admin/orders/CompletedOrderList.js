import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { ActiveOrderDescriptor } from './ActiveOrderList'
import { PlacedOrder } from './PlacedOrder'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { SimpleListView, Descriptor } from '/components/SimpleListView'

import { completedOrderStore, orderFilterStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/CompletedOrderList')

@observer
export class CompletedOrderList extends PureComponent {
    @computed get descriptor() {
        return new CompletedOrderDescriptor()
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

class CompletedOrderDescriptor extends ActiveOrderDescriptor {
    @computed get rows() {
        return orderFilterStore.filterOrders(completedOrderStore.completed)
    }

    onEndReached = () => {
        completedOrderStore.fetchMore()
    }

    refresh = () => this.runRefresh(completedOrderStore.refresh)
    renderFooter = () => <CompletedOrdersDownloadErrors />
}

@observer
class CompletedOrdersDownloadErrors extends DownloadResultView {
    finishOnLastValue = false
    getDownloadResult = completedOrderStore.getDownload
    renderFinished = () => null
}
