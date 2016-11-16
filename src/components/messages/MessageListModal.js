import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'
import Modal from 'react-native-modalbox'

import { OkCancelModal } from '../Modals.js'
import { MessageList } from './MessageList'
import { modalStore, messageStore } from '/model/store'


@observer
export class MessageListModal extends PureComponent {
    /* properties:
        visible: Bool
        onClose: () => void
    */

    componentDidMount = () => {
        /* Acknowledge all messages as read */
        messageStore.acknowledgeAllUnread()
    }

    handleClose = () => {
        modalStore.closeMessagListModal()
        this.props.onClose()
    }

    render = () => {
        if (!this.props.visible)
            return null
        return <OkCancelModal
                    ref={ref => this.modal =ref}
                    onClose={this.props.onClose}
                    showOkButton={false}
                    cancelLabel="Close"
                    cancelModal={this.handleClose}
                    visible={this.props.visible}
                    >
            <MessageList />
        </OkCancelModal>
    }
}
