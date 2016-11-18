import { observable, transaction, computed, action, asMap, autorun } from 'mobx'

import { downloadManager } from '../network/http'
// import { MessageDownload } from '../network/api/messages'
import { config } from '/utils/config'
import * as _ from '/utils/curry'
import { getTime } from '/utils/time'

const { log, assert } = _.utils('/model/messagestore')

/* What the message is about */
export type AboutType =
    | 'Bar'
    | 'Order'
    | 'Booking'
    | '...' /* other values are permitted, e.g. in later versions new message
               types may be introduced */

/* What action should be shown for this message.
   The default will depend on 'AboutType'
*/
export type AboutAction =
    | 'AddOrderToBooking'
    | '...'

export type Message = {
    // title: String,
    messageID: ID,
    timestamp: Float,
    title: String,
    content: String,
    aboutType: AboutType,
    acoutAction: ?AboutAction,
    aboutID: ?ID,
    flash: Bool,
    vibrate: Bool,
    sound: Bool,
    deepLink: ?String,
    /* Grouping tag (for an ungoing message stream) */
    grouping: ?String,
    popup: Bool,
    buttonLabel: ?String,
    /* TODO: Remove */
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

    @observable message : Message = null
    @observable popup   : Message = null

    /* Display the given message */
    @action showMessage = (message) => {
        if (message.popup)
            this.popup = message
        else
            this.message = message
    }

    @action dismissMessage = (message) => {
        if (this.message && this.message.messageID === message.messageID)
            this.message = null
        if (this.popup && this.popup.messageID === message.messageID)
            this.popup = null
    }
}

/*********************************************************************/
/* Store */
/*********************************************************************/

export const messageStore = new MessageStore()
