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

import { activeOrderStore } from '/model/store'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/BarOrderPage')

const styles = StyleSheet.create({
    iconBar: {
        flex: 1,
    }
})

const barOrderIcons = [
    <BarIcon
        key="messages"
        label="active"
        name="glass"
        getCounter={() => 3}
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

    @computed get activeOrderList() {
        return _.reverse(activeOrderStore.activeOrderList)
    }

    render = () => {
        return (
            <ScrollView style={{flex: 1}}>
                <ActiveOrderListDownloadErrors />
                {
                    this.activeOrderList.map((activeOrder, i) => {
                        return <T key={i}>{JSON.stringify(activeOrder)}</T>
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
