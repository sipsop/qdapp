// flow

import {
    React,
    Component,
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity,
} from './Component.js';
import { observable, transaction, computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { Cache, cache } from './Cache.js'
import { LargeButton } from './Button.js'
import { PureComponent } from './Component.js'
import { Loader } from './Page.js'
import { config } from './Config.js'
import { store } from './Store.js'
import { all, any } from './Curry.js'

import type { Int, Float, String, URL } from './Types.js'

/*********************************************************************/

export type HTTPOptions = RequestOptions

/*********************************************************************/

const HOST = 'http://192.168.0.6:5000'
// const HOST = 'http://192.168.0.20:5000'
// const HOST : string = 'http://172.24.176.169:5000'
// const HOST = 'http://localhost:5000/graphql'
// const HOST = 'http://10.147.18.19:5000'

export class TimeoutError {
    message : string
    constructor() {
        this.message = "Downloading is taking too long, please try again later."
    }
}

export class NetworkError {
    message : string
    constructor(message : string, status : string) {
        this.message = message
        this.status = status
    }
}

export type DownloadState =
    | 'NotStarted'  // download error
    | 'InProgress'  // download error
    | 'Finished'    // download error
    | 'Error'       // download error

export class DownloadResult<T> {

    @observable state   : DownloadState = 'NotStarted'
    @observable message : ?string       = undefined
    @observable value   : ?T            = null

    static combine = (obj) => {
        return new CombinedDownloadResult(obj)
    }

    downloadStarted = () : DownloadResult<T> => {
        transaction(() => {
            this.state   = 'InProgress'
            this.message = undefined
            this.value   = undefined
        })
        return this
    }

    downloadError = (message : string) : DownloadResult<T> => {
        transaction(() => {
            this.state   = 'Error'
            this.message = message
            this.value   = undefined
        })
        return this
    }

    downloadFinished = (value : T) : DownloadResult<T> => {
        transaction(() => {
            this.state   = 'Finished'
            this.message = undefined
            this.value   = value
        })
        return this
    }

    update = (f : (value : T) => T) : DownloadResult<T> => {
        if (this.state == 'Finished') {
            this.value = f(this.value)
        }
        return this
    }
}

class CombinedDownloadResult<T> {

    @observable obj

    constructor(obj) {
        this.obj = obj
        this._value = null
    }

    @computed get _results() {
        // NOTE: Use Object.keys() to ensure that MobX can log the accesses
        return Object.keys(this.obj).map(key => this.obj[key])
        // return Object.values(this.obj)
    }

    @computed get state() {
        console.log("COMPUTING STATE....")
        if (any(this._results.map(result => result.state === 'Error')))
            return 'Error'
        if (any(this._results.map(result => result.state === 'InProcess')))
            return 'InProcess'
        if (all(this._results.map(result => result.state === 'Finished'))) {
            console.log("SWITCH STATE TO FINISHED!")
            return 'Finished'
        }
        return 'NotStarted'
    }

    @computed get message() {
        const results = this._results
        for (var i = 0; i < results.length; i++) {
            if (results[i].state === 'Error')
                return results[i].message
        }
        return "No error has occurred..."
    }

    @computed get value() {
        if (this._value)
            return this._value
        if (this.state !== 'Finished')
            return null
        const result = {}
        Object.keys(this.obj).forEach(key => {
            result[key] = this.obj[key].value
        })
        return result
    }

    update = (f : (value : T) => T) : DownloadResult<T> => {
        if (this.state == 'Finished') {
            this._value = f(this.value)
        }
        return this
    }
}

export const emptyResult =
    <T>() : DownloadResult<T> => new DownloadResult()

/* React Component for rendering a downloadResult in its different states */
@observer
export class DownloadResultView<T> extends PureComponent {
    /* props:
        downloadResult: DownloadResult
    */

    constructor(props : {downloadResult: DownloadResult<T>}, errorMessage : string) {
        super(props)
        if (!errorMessage)
            throw Error('Expected an error message as argument to DownloadResultView')
        this.errorMessage = errorMessage
    }

    render = () => {
        const res = this.getDownloadResult()
        if (res.state == 'NotStarted') {
            return this.renderNotStarted()
        } else if (res.state == 'InProgress') {
            return this.renderInProgress()
        } else if (res.state == 'Finished') {
            return this.renderFinished(res.value)
        } else if (res.state == 'Error') {
            return this.renderError(res.message)
        } else {
            throw Error('unreachable')
        }
    }

    getDownloadResult = () => {
        throw Error('NotImplemented')
    }

    refreshPage = () => {
        throw Error('NotImplemented')
    }

    renderNotStarted = () => {
        throw Error('NotImplemented')
    }

    renderFinished = (value : T) => {
        throw Error('NotImplemented')
    }

    renderInProgress = () => <Loader />

    renderError = (message : string) => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>{this.errorMessage}</Text>
            <Text style={{textAlign: 'center', marginBottom: 20}}>
                 {message}
            </Text>
            <LargeButton label="Refresh" onPress={this.refreshPage} />
        </View>
    }
}

class DownloadManager {

    activeDownloads : Array<JSONDownload<any>>

    constructor() {
        this.activeDownloads = []
    }

    /* Execute a GraphQL query */
    graphQL = async /*<T>*/(
            /* key used for caching responses */
            key : string,
            /* GraphQL query string to execute */
            query : string,
            /* Callback that decides whether the download is still relevant */
            isRelevantCB : () => boolean,
            ) => { //: Promise<DownloadResult<T>> => {
        const httpOptions = {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/graphql',
            },
            body: query,
        }
        var result
        try {
            result = await this.fetchJSON(key, HOST + '/graphql', httpOptions, isRelevantCB)
        } catch (err) {
            console.error(err)
        }
        return result.update(value => value.data)
    }

    /* HTTP GET/POST/etc to a URL */
    fetchJSON = async /*<T>*/(
            /* key used for caching responses */
            key : string,
            /* URL to fetch */
            url : URL,
            /* HTTP options to pass to fetch() */
            httpOptions : HTTPOptions,
            /* Callback that decides whether the download is still relevant */
            isRelevantCB : () => boolean,
        ) : Promise<DownloadResult<T>> => {

        /* Remove any potential download with the same key that is still pending */
        this.activeDownloads = this.activeDownloads.filter(
            download => download.key !== key
        )

        if (!url)
            throw Error("dude I need a URL..." + key)

        /* Try a fresh download... */
        const downloadResult : DownloadResult<T> = await fetchJSONWithTimeouts(
                        key, url, httpOptions, 12000, 20000)
        // if (downloadResult.state === 'Error' && isRelevantCB) {
        //     /* There as been some error, try again later */
        //     this.activeDownloads.push(new JSONDownload(
        //         key, url, httpOptions, downloadResult, isRelevantCB))
        // }
        return downloadResult
    }

    /* Retry all pending downloads */
    retryDownloads = async () => {
        /* Concurrently retry all downloads that are still needed */
        const promises = []
        for (var i = 0; i < this.activeDownloads.length; i++) {
            const download = this.activeDownloads[i]
            if (download.isRelevant()) {
                promises.push({index: i, promise: download.retryFetchJSON()})
            }
        }

        /* Wait for promises to finish */
        const activeDownloads = []
        for (var i = 0; i < promises.length; i++) {
            const {index, promise} = promises[i]
            try {
                await promise
            } catch (e) {
                if (isNetworkError(e)) {
                    /* Retry this later... */
                    activeDownloads.push(this.activeDownloads[index])
                } else {
                    /* This is an actual error, re-throw */
                    throw e
                }
            }
        }

        /* Update the list of active downloads */
        this.activeDownloads = activeDownloads
    }
}

export const downloadManager = new DownloadManager()

class JSONDownload<T> {

    key : String
    url : URL
    httpOptions : HTTPOptions
    downloadResult : DownloadResult<T>
    isRelevant: () => boolean

    constructor(
            key             : String,
            url             : URL,
            httpOptions     : HTTPOptions,
            downloadResult  : DownloadResult<T>,
            isRelevant      : () => boolean,
            ) {
        this.key = key
        this.url = url
        this.httpOptions = httpOptions
        this.downloadResult = downloadResult
        this.isRelevant = isRelevant
    }

    retryFetchJSON = async () => {
        this.downloadResult.downloadStarted()
        const downloadResult : any =
            await fetchJSON(this.key, this.url, this.httpOptions)
        this.downloadResult.update(_ => downloadResult.value)
    }

}


const fetchJSON = async /*<T>*/(
        key : string,
        url : URL,
        httpOptions : HTTPOptions
        ) : Promise<DownloadResult<T>> => {
    return await fetchJSONWithTimeouts(key, url, httpOptions, 5000, 12000)
}

const isNetworkError = (e : Error) : boolean =>
    e instanceof NetworkError || e instanceof TimeoutError

const fetchJSONWithTimeouts = async /*<T>*/(
        key : string,
        url : URL,
        httpOptions : HTTPOptions,
        refreshTimeout : Float,
        expiredTimeout : Float,
        ) : Promise<DownloadResult<T>> => {

    const refreshCallback = async () => {
        return await _fetchJSON(url, httpOptions, refreshTimeout)
    }
    const expiredCallback = async () => {
        return await _fetchJSON(url, httpOptions, expiredTimeout)
    }

    try {
        const result = await cache.get(key, refreshCallback, /*expiredCallback*/)
        return new DownloadResult().downloadFinished(result)
    } catch (e) {
        if (isNetworkError(e))
            return new DownloadResult().downloadError(e.message)
        throw e
    }
}

const _fetchJSON = async /*<T>*/(
        url             : URL,
        httpOptions     : HTTPOptions,
        downloadTimeout : Float,
        ) : Promise<T> => {
    var response : Response
    try {
        console.log("Starting fetch...", url, httpOptions)
        const fetchPromise : Promise<Response> = fetch(url, httpOptions)
        response = await timeout(downloadTimeout, fetchPromise)
        // response = await fetch(url, httpOptions)
    } catch (err) {
        throw new NetworkError(err.message)
    }
    if (response.status !== 200) {
        throw new NetworkError("Network Error", response.status)
    }
    return await response.json()
}


/************/
/* Promises */
/************/

const timedout = { timedout: true }

const timeoutPromise = (timeout, callback) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(callback()), timeout)
    })
}

const timeoutError = (timeout) => {
    return timeoutPromise(timeout, () => {
        return timedout
    })
}

/* Set a timeout for an asynchronous callback */
const timeout = async (timeout, promise) => {
    const tPromise = timeoutError(timeout)
    const result = await Promise.race([tPromise, promise])
    if (result == timedout) {
        console.log("download timed out...")
        throw new TimeoutError()
    }
    return result
}

const promise = f => new Promise((resolve, reject) => {
    try {
        resolve(f())
    } catch (err) {
        reject(err)
    }
})
