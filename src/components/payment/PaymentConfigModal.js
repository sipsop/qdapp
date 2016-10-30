import { React, Component, ScrollView, View, PureComponent, T } from '~/src/components/Component'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '../Header'
import { SimpleModal } from '../Modals'
import { LazyComponent } from '../LazyComponent'
import { CreditCardList } from './CreditCardList'

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
