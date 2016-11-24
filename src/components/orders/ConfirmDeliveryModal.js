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
    Dimensions,
} from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { SmallOkCancelModal } from '/components/Modals'
import { DeliveryMethod } from './DeliveryMethod'

import { orderStore, modalStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/AskDeliveryModal')

@observer
export class ConfirmDeliveryModal extends PureComponent {
    /* properties:
        onConfirm: ?() => void
        onClose: ?() => void
        isVisible: ?() => Bool
    */

    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    @action confirm = () => {
        orderStore.confirmDeliveryMethod()
        this.props.onConfirm && this.props.onConfirm()
    }

    render = () => {
        return (
            <SmallOkCancelModal
                ref={ref => this.modal = ref}
                showOkButton={orderStore.haveDeliveryMethod}
                okLabel={`Checkout`}
                onConfirm={this.confirm}
                onClose={this.props.onClose}
                isVisible={this.props.isVisible}
                >
                <DeliveryMethod />
            </SmallOkCancelModal>
        )
    }
}
