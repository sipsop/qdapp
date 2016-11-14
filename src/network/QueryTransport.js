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
    /*
    A mapping of active query/feed names to promise resolve functions.
    */
    activeQueries = {}
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
        this.ws.onmessage = this.onMessage
        this.ws.onerror = this.onError
        this.ws.onclose = this.onClose
    }

    /* Successfully established connection with 'ws'. */
    @action onOpen = (ws) => {
        if (!this.connected) {
            this.ws = ws
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
            delete this.activeQueries[messageID]
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
    fetch = (query : Query, downloadTimeout : Float) : Promise<QueryResponse> => {
        const promise = new Promise((resolve, reject) => this.feed(query, resolve))
        try {
            return _.timeout(downloadTimeout, promise)
        } catch (err) {
            throw new NetworkError(err.message)
        }
    }

    feed = (query : Query, resolve : (QueryResponse) => void) => {
        assert(query.messageID != null, "messageID is null...")
        const messageID = query.messageID
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
