import { observable, transaction, computed, action, autorun } from 'mobx'
import { parseJSON } from '/utils/utils'

export type QueryType =
    | 'query'
    | 'feed'

export type Query<T> = {
    messageID:  String,
    type:       QueryType,
    query:      TypeSpec<T>,
}

export type QueryResponse<T> = {
    messageID:  String,
    queryName:  String,
    error:      ?String,
    result:     ?T,
}

export class QueryTransport {
    /* { messageID: { resolve, query } } */
    activeQueries = {}
    timeouts = {}
    @observable connected = false

    constructor(endpoint : URL, tryReconnectAfter = 5000) {
        this.endpoint = endpoint
        this.tryReconnectAfter = tryReconnectAfter
        this.ws = null
    }

    /* Try to (re-)connect every 5s */
    tryConnect = () => {
        if (!this.connected) {
            this.connect()
            setTimeout(this.tryConnect, this.tryReconnectAfter)
        }
    }

    connect = () => {
        ws = new Websocket(this.endpoint)
        this.ws.onopen = () => this.onOpen(ws)
    }

    /* Successfully established connection with 'ws'. */
    @action onOpen = (ws) => {
        if (!this.connected) {
            this.ws = ws
            this.ws.onmessage = this.onMessage
            this.ws.onerror = this.onError
            this.ws.onclose = this.onClose

            this.connected = true
            this.dispatchMessages()
        } else {
            /* We successfully established a connection on another websocket
            in the meantime, close this one */
            ws.close()
        }
    }

    onMessage = (event) => {
        const data = event.data
        const messageID = data.messageID
        const { resolve } = this.activeQueries[messageID]
        /* Make sure that query/feed is still active */
        if (resolve) {
            resolve(data)
        }
    }

    onError = (e) => {
        /* TODO: ... */
        e.message
    }

    @action onClose = () => {
        this.connected = false
        this.tryConnect()
    }

    /* Submit query and expect response with timeout */
    fetch = async (query : Query, timeout : Float) : Promise<QueryResponse> => {
        assert(query.messageID != null, "messageID is null...")
        const messageID = query.messageID
        try {
            const result = await new Promise((resolve, reject) => {
                this.feed(query, resolve, reject, timeout)
            })
            delete this.activeQueries[messageID]
            return result
        } catch (err) {
            delete this.activeQueries[messageID]
            throw new NetworkError(err.message)
        }
    }

    feed = (query, timeout, resolve, reject) => {
        assert(query.messageID != null, "messageID is null...")
        const messageID = query.messageID
        if (timeout) {
            resolve = timeoutCallback(timeout, resolve, reject)
        }
        this.activeQueries[messageID] = { query, resolve }
        if (this.connected) {
            this.ws.send(JSON.stringify(query))
        }
    }

    /* Dispatch any active messages in the queue */
    dispatchMessages = () => {
        const activeQueries = this.activeQueries
        this.activeQueries = {}
        Object.values(this.activeQueries).forEach(({query, resolve}) => {
            this.feed(query, resolve)
        })
    }
}
