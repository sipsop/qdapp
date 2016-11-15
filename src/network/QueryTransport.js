import { observable, transaction, computed, action, autorun } from 'mobx'
import { parseJSON } from '/utils/utils'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/QueryTransport')

export type QueryType =
    | 'query'
    | 'feed'

export type QRequest<T> = {
    messageID:  String,
    type:       QueryType,
    query:      TypeSpec<T>,
}

export type QResponse<T> = {
    messageID:  String,
    queryName:  String,
    error:      ?String,
    result:     ?T,
}

/* WebSocket.readyState values */
CONNECTING = 0
OPEN = 1
CLOSING = 2
CLOSED = 3

export class QueryTransport {
    /* { messageID: { resolve, request } } */
    activeQueries = {}
    timeouts = {}
    @observable connected = false
    @observable firstMessageReceived = false

    constructor(endpoint : URL, tryReconnectAfter = 5000) {
        this.endpoint = endpoint
        this.tryReconnectAfter = tryReconnectAfter
        this.ws = null
    }

    /* Try to (re-)connect every 5s */
    tryConnect = () => {
        if (!this.connected) {
            this.connect()
        }
        setTimeout(this.tryConnect, this.tryReconnectAfter)
    }

    connect = () => {
        log("Trying to establish a websocket connection...")
        ws = new WebSocket(this.endpoint)
        ws.onopen = () => this.onOpen(ws)
        ws.onmessage = () => null
        ws.onerror = () => null
        ws.onclose = () => null
    }

    /* Successfully established connection with 'ws'. */
    @action onOpen = (ws) => {
        if (!this.connected) {
            log("websocket connection established...", ws.readyState)
            this.ws = ws
            this.ws.onmessage = this.onMessage
            this.ws.onerror = this.onError
            this.ws.onclose = this.onClose

            this.connected = true
            this.send({messageID: "ping"})
            this.dispatchMessages()
        } else {
            /* We successfully established a connection on another websocket
            in the meantime, close this one */
            ws.close()
        }
    }

    onMessage = (event) => {
        if (!event.data)
            return
        this.firstMessageReceived = true
        const data = parseJSON(event.data)
        const messageID = data.messageID
        const feedParams = this.activeQueries[messageID]
        /* Make sure that query/feed is still active */
        if (data.messageID === "pong") {
            /* Nothing to do */
        } else if (feedParams) {
            feedParams.resolve(data)
        }
    }

    @action onError = (e) => {
        // log("WEBSOCKET ERROR:", e.message)
        this.onClose()
    }

    @action onClose = () => {
        this.ws = null
        this.connected = false
        this.firstMessageReceived = false
    }

    /* Submit query and expect response with timeout */
    fetch = async (request : QRequest, timeout : Float) : Promise<QResponse> => {
        assert(request.messageID != null, "messageID is null...")
        try {
            return await new Promise((resolve, reject) => {
                this.feed({
                    request: request,
                    resolve: _.timeoutCallback(timeout, resolve, reject),
                })
            })
        } finally {
            this.disposeMessage(request.messageID)
        }
    }

    feed = (feedParams) => {
        var { request, resolve } = feedParams
        log("Scheduling request with messageID...", request.messageID)
        assert(request.messageID != null, "messageID is null...")
        this.activeQueries[request.messageID] = feedParams
        if (this.connected) {
            log("SENDING MESSAGE...", request.messageID)
            this.send(request)
        } else {
            log("NOT CONNECTED! WILL SEND LATER...", request.messageID)
        }
    }

    send = (request) => {
        if (this.ws.readyState === OPEN) {
            this.ws.send(JSON.stringify(request))
        }
    }

    /* Dispatch any active messages in the queue */
    dispatchMessages = () => {
        Object.values(this.activeQueries).forEach((feedParams) => {
            this.feed(feedParams)
        })
    }

    disposeMessage = (messageID) => {
        delete this.activeQueries[messageID]
    }
}
