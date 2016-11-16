import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager } from '../network/http.js'
// import { MessageDownload } from '../network/api/messages.js'
import { config } from '/utils/config.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/model/messagestore')

/* What the message is about */
export type AboutType =
    | 'Bar'
    | 'Order'
    | 'Booking'
    | '...' /* other values are permitted, e.g. in later versions new message
               types may be introduced */

export type About = {
    type: AboutType,
    id: ?ID,
}

export type Message = {
    // title: String,
    id: ID,
    timestamp: Float,
    content: String,
    about: About,
    flash: Bool,
    beep: Bool,
    popup: Bool,
    buttonLabel: ?String,
    buttonPress: ?() => void,
}

const defaultMessage = {
    flash: false,
    beep: false,
    popup: false,
}

export const makeMessage = (message) => {
    // assert(message.title != null)
    assert(message.content != null)
    return {
        ...defaultMessage,
        ...message,
    }
}

class MessageStore {

    /* Mapping from message ID to Message for the last100Messages */
    messageByID = {}

    /* The latest 100 messages */
    @observable last100Messages = []
    /* Any unread/unviewed messages */
    @observable unreadMessages = []
    /* Messages that should be popped up */
    @observable popupMessages = []

    /*********************************************************************/
    /* State */
    /*********************************************************************/

    initialize = () => {
        // TODO: messages download
    }

    @computed get numberOfUnreadMessages() {
        return this.unreadMessages.length + this.popupMessages.length
    }

    /*********************************************************************/
    /* Download Actions */
    /*********************************************************************/

    refresh = async () => {
        // TODO:
    }

    /*********************************************************************/
    /* Actions */
    /*********************************************************************/

    /* Add a bunch of messages to the store */
    @action addMessages = (messages) => {
        messages.forEach((message) => {
            this.messageByID[message.id] = message
            this.last100Messages.push(message)
            if (message.popup) {
                this.popupMessages.push(message)
            } else {
                this.unreadMessages.push(message)
            }
        })
        const last100Messages = _.sortBy(this.last100Messages, 'timestamp')
        const beginPos = _.max(last100Messages.length - 100, 0)
        /* Delete old messages */
        last100Messages.slice(0, beginPos).forEach(message => {
            delete this.messageByID[message.id]
        })
        this.last100Messages = last100Messages.slice(beginPos)
    }

    /* Acknowledge a message by viewing it or dismissing it as a popup */
    @action acknowledge = (messageID) => {
        if (containsMessage(this.unreadMessages, messageID)) {
            this.unreadMessages = this.unreadMessages.filter(message => {
                return message.id !== messageID
            })
        } else if (containsMessage(this.popupMessages, messageID)) {
            this.unreadMessages = this.popupMessages.filter(message => {
                return message.id !== messageID
            })
        }
    }

    /*
    Acknowledge all unread messages as read.

    NOTE:
        This does not acknowledge popup messages, as they are
        sufficiently important that they should be dismissed manually.
    */
    @action acknowledgeAllUnread = () => {
        this.unreadMessages = []
    }
}

/*********************************************************************/
/* Helpers */
/*********************************************************************/

containsMessage = (messages : Array<Message>, messageID) : Bool => {
    return _.includes(messages, messageID, (message, messageID) => {
        return message.id == messageID
    })
}

/*********************************************************************/
/* Store */
/*********************************************************************/

export const messageStore = new MessageStore()

/* TOOD: Remove, testing only */
messageStore.addMessages([
    makeMessage({
        content: "Some stuff here... blah blah blah blah blah",
    })
])
