import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { SmallOkCancelModal } from '../Modals'
import { messageStore } from '/model/store'
import * as _ from '/utils/curry'

/* NOTE:
    Ideally we pass in the state from above, but this requires the
    entire parent to be re-rendered on popup
*/
@observer
export class MessagePopup extends PureComponent {
    /* properties:
        message: messagestore.Message
        onClose: ?() => void
        visible: Bool
    */

    @action openMessageDeeplink = () => {
        // TODO:
    }

    render = () => {
        const message = messageStore.popup
        if (!message)
            return null
        return (
            <SmallOkCancelModal
                title={message.title}
                message={message.content}
                showOkButton={message.deepLink != null}
                okLabel="View"
                cancelLabel="Dismiss"
                onConfirm={this.openMessageDeeplink}
                onClose={() => messageStore.dismissMessage(message)}
                visible={true}
                closeOnTouch={true}
                />
        )
    }
}
