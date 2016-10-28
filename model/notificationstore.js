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

export const NotificationLevels = {
    INFO: 0,
    WARNING: 1,
    ERROR: 2,
    IMPORTANT: 3,
}

const defaultMessage : Message = {
    closeable: true,
    buttonLabel: null,
    priority: NotificationLevels.INFO,
}

class NotificationStore {
    @observable notifications = []
    @observable flashed = {}
    idToMessage = {}

    /*********************************************************************/
    /* Derivations                                                       */
    /*********************************************************************/

    @computed get prioritizedNotifications() {
        return _.sortBy(notificationStore.notifications, 'priority')
    }

    /* Flash notification to show */
    @computed get flashMessage() {
        const currentID = this.currentNotification && this.currentNotification.id
        /* Find a message that hasn't been flashed yet */
        for (var i = 0; i < notificationStore.notifications.length; i++) {
            const message = notificationStore.notifications[i]
            if (message.id !== currentID && !this.flashed[message.id]) {
                return message
            }
        }
    }

    @computed get currentNotification() {
        const ns = notificationStore.prioritizedNotifications
        return ns.length && ns[ns.length - 1]
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    /* Notify the user with a message */
    @action notify = (message) => {
        assert(message.id != null, 'message.id != null')
        assert(message.message != null, 'message.message != null')
        this.notifications.push({...defaultMessage, ...message})
        this.idToMessage[message.id] = message
    }

    /* Dismiss notification by messsage ID */
    @action dismiss = (id : String) => {
        /* call message.onDismiss() */
        const message = this.idToMessage[id]
        if (!message) {
            /* Message is not an active notification */
            return
        }
        message.onDismiss && message.onDismiss(id)

        /* Clear notification from notification list */
        delete this.idToMessage[id]
        this.notifications = this.notifications.filter(
            message => message.id !== id
        )
    }
}

export const notificationStore = new NotificationStore()
