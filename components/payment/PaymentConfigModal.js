import { React, Component, ScrollView, View, PureComponent, T } from './Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '../Header.js'
import { SimpleModal } from '../Modals.js'
import { LazyComponent } from '../LazyComponent.js'
import { CreditCardList } from './CreditCardList.js'

@observer
export class PaymentConfigModal extends PureComponent {
    modal = null

    show = () => {
        this.modal.show()
    }

    render = () => {
        return (
            <SimpleModal
                    ref={ref => this.modal = ref}
                    onClose={this.props.onClose}
                    >
                <ScrollView>
                    <TextHeader
                        label="Payment Details"
                        rowHeight={55}
                        />
                    <CreditCardList />
                </ScrollView>
            </SimpleModal>
        )
    }
}
