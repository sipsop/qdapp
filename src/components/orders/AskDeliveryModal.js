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

import { store, orderStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/AskDeliveryModal')

@observer
export class AskDeliveryModal extends PureComponent {
    /* properties:
        onConfirm: () => void
    */

    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    render = () => {
        {/*
        <Message
            ref={ref => this.modal = ref}
            message="Please enter a table number or pickup location"
            />
        */}
        return <SmallOkCancelModal
                    ref={ref => this.modal = ref}
                    showOkButton={orderStore.haveDeliveryMethod}
                    okLabel={`Checkout`}
                    onConfirm={this.props.onConfirm}
                    >
            <DeliveryMethod />
        </SmallOkCancelModal>
    }
}
