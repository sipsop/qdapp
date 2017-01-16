import { React, Component, PureComponent, View, T, StyleSheet } from '/components/Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '/components/Header'
import { OkCancelModal } from '/components/Modals'
import { ConnectionBar } from '/components/notification/ConnectionBar'
import { DeliveryMethod } from './DeliveryMethod'

import { modalStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/orders/OrderModal')

const styles = StyleSheet.create({
    deliveryMethod: {
        flex: 1,
        // justifyContent: 'center',
        margin: 10,
    },
})

@observer
export class DeliveryModal extends PureComponent {
    /* TODO: Proper routing */

    @action handleBack = () => {
        modalStore.openOrderModal()
        modalStore.closeDeliveryModal()
    }

    @action handleOrderPress = () => {
        modalStore.openCheckoutModal()
        modalStore.closeDeliveryModal()
    }

    render = () => {
        if (!modalStore.showDeliveryModal)
            return null

        return (
            <OkCancelModal
                visible={modalStore.showDeliveryModal}
                showOkButton={true}
                showCancelButton={false}
                cancelModal={modalStore.closeDeliveryModal}
                okModal={this.handleOrderPress}
                okLabel="Checkout"
                >
                <ConnectionBar />
                <TextHeader
                    label="Delivery Method"
                    onBack={this.handleBack}
                    />
                <View style={styles.deliveryMethod}>
                    <DeliveryMethod />
                </View>
            </OkCancelModal>
        )
    }
}
