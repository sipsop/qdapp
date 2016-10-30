import React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { barStore } from '/model/barstore.js'
import { orderStore } from '/model/store.js'
import { SmallOkCancelModal } from '../Modals.js'

import { PureComponent } from '/components/Component'

@observer
export class ConfirmChangeBarModal extends PureComponent {
    /* properties:
        onCOnfirm: () => void
    */
    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    @computed get currentBarName () {
        const currentBar = barStore.getBar()
        return currentBar ? currentBar.name : ''
    }

    render = () => {
        return (
            <SmallOkCancelModal
                ref={ref => this.modal = ref}
                message={`Do you want to erase your order (${orderStore.totalText}) at ${this.currentBarName}?`}
                onConfirm={this.props.onConfirm}
                />
            )
    }
}
