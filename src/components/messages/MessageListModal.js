import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { SimpleModal } from '../Modals.js'
import { MessageList } from './MessageList'
import { messageStore } from '/model/messagestore'

@observer
export class MessageListModal extends PureComponent {
    /* properties:
        onClose: () => void
    */
    modal = null

    show = () => this.modal.show()

    componentDidMount = () => {
        /* Acknowledge all messages as read */
        messageStore.acknowledgeAllUnread()
    }

    render = () => {
        return <SimpleModal
                    ref={ref => this.modal =ref}
                    onClose={this.props.onClose}
                    >
            <MessageList />
        </SimpleModal>
    }
}
