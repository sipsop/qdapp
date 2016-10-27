import { observable, transaction, computed, action, autorun } from 'mobx'
import * as _ from '~/utils/curry.js'
import type { Int, Float, String, URL } from '~/utils/types.js'

const { log, assert } = _.utils(__filename)

export type Message = {
    /* ID of the message. A message notification may be sent multiple times */
    id: String,
    message: String,
    /* Timeout in seconds before a message can reappear after having been dismissed */
    reappearTimeout: Int,

    closeable: Bool,
    buttonLabel: String,
    onDismiss: (id : String) => void,

    /* Message priority. Higher has more priority */
    priority: Int,
}

class NotificationStore {
    @observable notifications = []
    idToMessage = {}

    const defaultMessage = {
        closeable: true,
        buttonLabel: null,
        priority: 0,
    }

    /* Notify the user with a message */
    @action notify = (message) => {
        assert(message.id != null, 'message.id != null')
        assert(message.message != null, 'message.message != null')
        this.notifications.push(message)
        this.idToMessage[message.id] = message
    }

    /* Dismiss notification by messsage ID */
    @action dismiss = (id : String) => {
        /* call message.onDismiss() */
        const message = this.idToMessage[id]
        message.onDismiss && message.onDismiss(id)

        /* Clear notification from notification list */
        delete this.idToMessage[id]
        this.notifications = this.notifications.filter(
            message => message.id !== id
        )
    }
}

export notificationStore = new NotificationStore()
