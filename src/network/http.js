import { observable, transaction, computed, action, autorun } from 'mobx'

import { Cache, cache } from './cache'
import { config } from '/utils/config'
import { parseJSON } from '/utils/utils'
import { HOST, WebSocketHOST } from './host'
import { getTime, Second, Minute } from '/utils/time'
import { QueryTransport } from './QueryTransport'
import * as _ from '/utils/curry'

import type { Int, Float, String, URL } from '/utils/types'

const { log, assert } = _.utils('/network/http')

export type HTTPOptions = RequestOptions

export type DownloadState =
    | 'NotStarted'  // download error
    | 'InProgress'  // download error
    | 'Finished'    // download error
    | 'Error'       // download error


/***********************************************************************/
/* Exceptions                                                          */
/***********************************************************************/

export class NetworkError {
    message : string
    constructor(message : string, status : string) {
        this.message = message
        this.status = status
    }
}

/***********************************************************************/
/* Network stuff                                                       */
/***********************************************************************/

export class DownloadResult<T> {

    @observable state   : DownloadState = 'NotStarted'
    @observable message : ?string       = undefined
    @observable value   : ?T            = null

    static combine = (downloadResults : Array<DownloadResult<*>>) => {
        return new CombinedDownloadResult(downloadResults)
    }

    getState = () => {
        return {
            state:      this.state,
            message:    this.message,
            value:      this.value,
        }
    }

    @action setState = (downloadState) => {
        this.state   = downloadState.state
        this.message = downloadState.message
        this.value   = downloadState.value
        if (downloadState.state === 'InProgress') {
            this.state = 'Error'
            this.message = 'Please try again'
        }
    }

    @action from = (downloadResult : DownloadResult<T>) => {
        this.state   = downloadResult.state
        this.message = downloadResult.message
        this.value   = downloadResult.value
    }

    @action reset = (state = 'NotStarted') : DownloadResult<T> => {
        this.state   = state
        this.message = null
        this.value   = null
        return this
    }

    @action downloadStarted = () : DownloadResult<T> => {
        return this.reset('InProgress')
    }

    @action downloadError = (message : string, refresh : () => void) : DownloadResult<T> => {
        this.reset('Error')
        this.message = message
        return this
    }

    @action downloadFinished = (value : T) : DownloadResult<T> => {
        this.reset('Finished')
        this.value   = value
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

    constructor(downloadResults : Array<DownloadResult>) {
        this.downloadResults = downloadResults
        this._value = null
    }

    @computed get state() {
        if (_.any(this.downloadResults.map(result => result.state === 'Error')))
            return 'Error'
        if (_.any(this.downloadResults.map(result => result.state === 'InProgress')))
            return 'InProgress'
        if (_.all(this.downloadResults.map(result => result.state === 'Finished')))
            return 'Finished'
        return 'NotStarted'
    }

    @computed get errorIndex() {
        const results = this.downloadResults
        for (let i = 0; i < results.length; i++) {
            if (results[i].state === 'Error')
                return i
        }
        return -1
    }

    @computed get haveError() {
        return this.errorIndex >= 0
    }

    @computed get message() {
        return this.downloadResults[this.errorIndex].message
    }

    @computed get refresh() {
        if (!this.haveError)
            return null
        return this.downloadResults[this.errorIndex].refresh
    }

    @computed get value() {
        if (this._value)
            return this._value
        if (this.state !== 'Finished')
            return null
        return this.downloadResults.map(downloadResult => downloadResult.value)
    }

    update = (f : (value : T) => T) : DownloadResult<T> => {
        if (this.state == 'Finished') {
            this._value = f(this.value)
        }
        return this
    }
}

export const emptyResult = <T>() : DownloadResult<T> => {
    return new DownloadResult()
}

/* Class for declarating an JSON API request */
export class Download {

    @observable downloadState  : DownloadState = 'NotStarted'
    @observable _message : ?string             = null
    @observable value   : ?T                   = null

    /*  The last 'value' result of this download. This is useful during the
        'refresh period' (state = 'InProgress'), where we clear 'value' but
        don't want to show the loading indicator to the user.
    */
    @observable lastValue : ?T = null
    @observable timestamp = null
    @observable errorAttempts : Int = 0
    @observable lastRefreshState = null
    @observable promise = null

    @observable name            : String = null
    @observable errorMessage    : ?String = null
    @observable periodicRefresh : ?Int = null           /* refresh every N seconds */
    @observable depends         : Array<String> = []  /* Download dependency names */

    /* Restore download state after a restart */
    @observable restoreAfterRestart = false

    /* Whether to trigger this download automatically whenever it's active and
       its refreshState changes
    */
    @observable autoDownload = true

    /* How long results should be cached for */
    @observable cacheInfo = config.defaultCacheInfo

    /* Cache info for forced refreshes */
    @observable refreshCacheInfo = config.defaultRefreshCacheInfo

    /* How long before a download times out */
    @observable timeoutDesc = 'normal'

    constructor(getProps, attrib) {
        /* function returning props derived from a (observable) model state */
        this.getProps = getProps
        /* Override 'name' and 'onFinish' attributes */
        if (attrib != null) {
            transaction(() => {
                if (attrib.name)
                    this.name = attrib.name
                if (attrib.onStart)
                    this.onStart = attrib.onStart
                if (attrib.onFinish)
                    this.onFinish = attrib.onFinish
            })
        }
    }

    @computed get props() {
        return this.getProps()
    }

    @computed get active() {
        return true
    }

    @computed get cacheKey() {
        throw Error(`cacheKey method not implemented in ${this.name}`)
    }

    @computed get url() {
        return null
    }

    @computed get httpOptions() {
        return null
    }

    /* Refresh the download whenever 'url' or 'httpOptions' change */
    @computed get refreshState() {
        throw Error("refreshState method not implement")
    }

    /***********************************************************************/
    /* State (Use when restoreAfterRestart = true)                         */
    /***********************************************************************/

    getState = () => {
        return {
            state:      this.downloadState,
            message:    this._message,
            value:      this.value,
        }
    }

    @action setState = (savedState) => {
        this.downloadState = savedState.state
        this._message      = savedState.message
        this.value         = savedState.value
        if (savedState.state === 'InProgress') {
            this.downloadState  = 'Error'
            this._message = 'Please try again'
        }
    }

    /***********************************************************************/
    /* Refresh                                                             */
    /***********************************************************************/

    /* Is the download outdated? */
    @computed get shouldRefresh() {
        return !this.inProgress &&
               this.periodicRefresh &&
               (this.timestamp + this.periodicRefresh < ticker.now)
    }

    /* Should we retry errored downloads? */
    @computed get shouldRetry() {
        /* We should start a download when either it has never started, or when
           it has had an error and not been reattempted for the last 10s.
        */
        return (
            this.state === 'NotStarted' || (
                this.state === 'Error' &&
                this.errorAttempts < 3 &&
                this.timestamp + 10 < ticker.now
            )
        )
    }

    @computed get dependencies() {
        return this.depends.map(downloadManager.getDownload)
    }

    /* Have all download dependencies finished? */
    @computed get dependenciesFinished() {
        return _.all(this.dependencies.map(
            download => download.finished
        ))
    }

    @computed get refreshStateChanged() {
        return !_.deepEqual(this.refreshState, this.lastRefreshState)
    }

    /* Should we start refreshing the download now? */
    @computed get shouldRefreshNow() {
        return (
            this.active &&
            this.dependenciesFinished && (
                this.shouldRetry   ||
                this.shouldRefresh ||
                this.refreshStateChanged
            )
        )
    }

    /* Method to force a refresh (e.g. on UI pull downs) */
    forceRefresh = async () => {
        if (this.state !== 'InProgress')
            await this.refresh(this.refreshCacheInfo)
    }

    refresh = async (cacheInfo) => {
        log("REFRESHING:", this.name, this.errorAttempts)
        const refreshState = this.refreshState
        const timestamp = getTime()

        // Update timestamp
        transaction(() => {
            this.downloadStarted()
            this.onStart()
            this.timestamp = timestamp
            if (this.refreshStateChanged) {
                /* lastValue and _message have become stale, clear them */
                this.lastValue = null
                this._message  = null
            }
            this.lastRefreshState = refreshState
        })

        // Download
        cacheInfo = cacheInfo || this.cacheInfo
        const promise = this.fetch(cacheInfo)
        this.promise = promise
        const downloadResult = await promise

        if (timestamp < this.timestamp) {
            // Result from an out-of-date download -- do not use
            return
        }

        transaction(() => {
            // Update state
            if (downloadResult.state === 'Finished') {
                /* NOTE: Do not use downloadFinished(), as it sets 'lastValue',
                         and the downloaded value may indicate an error that
                         could result in downloadError() being called instead.
                */
                // this.downloadFinished(downloadResult.value)
                this.reset('Finished')
                this.value = downloadResult.value
                this.finish()
            } else if (downloadResult.state === 'Error') {
                this.downloadError(downloadResult.message)
            } else {
                throw Error(`Invalid download state: ${downloadResult.state}`)
            }
        })
    }

    fetch = () : Promise<T> => {
        throw Error("fetch() not implemented")
    }

    /* Process the value before caching (e.g. parse JSON) */
    processValue = (value) => value

    /* Whether to accept the cached value as a useful result.
    Return false for downloads that returned errors. */
    acceptValueFromCache = (value) => true

    finish() {
        /*
        Update the download state here for any finished download

            Must use non-lambda functions, otherwise overriding and super()
            do not work. Broken stupid shit.
        */
        this.onFinish()
    }

    /* These methods can be overridden by passing 'attrib' to the constructor of
       Download */
    onStart  = () => null
    onFinish = () => null

    wait = async () => {
        if (this.promise)
            await this.promise
    }

    /***********************************************************************/
    /* Download State                                                      */
    /***********************************************************************/

    @action reset = (state = 'NotStarted') : DownloadResult<T> => {
        this.downloadState  = state
        this._message = null
        this.value   = null
        return this
    }

    @action resetErrorAttempts = () => {
        this.errorAttempts = 0
    }

    @action downloadStarted = () : DownloadResult<T> => {
        this.downloadState = 'InProgress'
        this.value = null
        /* NOTE: Don't reset _message, as we need it for 'lastMessage' */
        return this
    }

    @action downloadError = (message : string) : DownloadResult<T> => {
        this.errorAttempts += 1
        this.downloadState  = 'Error'
        this.value = null
        this._message = message
        return this
    }

    @action downloadFinished = (value : T) : DownloadResult<T> => {
        this.reset('Finished')
        this.resetErrorAttempts()
        this.value = value
        this.lastValue = value
        return this
    }

    @computed get state() {
        if (this.downloadState === 'NotStarted' && this.active) {
            if (_.any(this.dependencies.map(result => result.state === 'Error')))
                return 'Error'
            if (_.any(this.dependencies.map(result => result.state === 'InProgress')))
                return 'InProgress'
        }
        return this.downloadState
    }

    @computed get errorIndex() {
        const results = this.dependencies
        for (let i = 0; i < results.length; i++) {
            if (results[i].state === 'Error')
                return i
        }
        return -1
    }

    @computed get haveErrorMessage() {
        return this._message != null
    }

    @computed get message() {
        let message
        if (this._state === 'NotStarted' || this.errorIndex >= 0)
            message = this.dependencies[this.errorIndex].message
        else
            message = this._message

        const errorMessage = this.errorMessage || `Error downloading ${this.name}`
        return errorMessage + (message ? ':\n' + message : '')
    }

    @computed get lastMessage() {
        if (this.state === 'Error' || (this.state === 'InProgress' && this._message != null))
            return this.message
        return null
    }

    @computed get finished() {
        return this.state === 'Finished'
    }

    @computed get inProgress() {
        return this.state === 'InProgress'
    }
}

export class HTTPDownload extends Download {
    /* Refresh the download whenever 'url' or 'httpOptions' change */
    @computed get refreshState() {
        return {
            url: this.url,
            httpOptions: this.httpOptions,
        }
    }

    fetch = async (cacheInfo) => {
         return await downloadManager.fetch({
            key: this.cacheKey,
            url: this.url,
            httpOptions: this.httpOptions,
            cacheInfo: cacheInfo,
            timeoutInfo: {
                timeoutDesc: this.timeoutDesc,
            },
            processValue: this.processValue,
            acceptValueFromCache: this.acceptValueFromCache,
        })
    }
}

export class JSONDownload extends HTTPDownload {
    processValue = (value) => parseJSON(value)
}

/* TODO: Re-use properties below */
export class JSONMutation extends JSONDownload {
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache
    restoreAfterRestart = true
    autoDownload = false

    @computed get cacheKey() {
        return 'DO_NOT_CACHE'
    }
}

export class QueryDownload extends Download {
    @computed get refreshState() {
        return this.query
    }

    @computed get query() {
        return null
    }

    fetch = async (cacheInfo) => {
        return await downloadManager.query(this.name, {
            key: this.cacheKey,
            query: this.query,
            cacheInfo: cacheInfo,
            timeoutInfo: {
                timeoutDesc: this.timeoutDesc,
            },
            processValue: this.processValue,
            acceptValueFromCache: this.acceptValueFromCache,
        })
    }

    acceptValueFromCache = (value) => value.result && !value.error

    finish() {
        /* Unpack the queries result value or error message */
        super.finish()
        if (this.value && this.value.error) {
            this.downloadError(this.value.error)
        } else if (this.value) {
            this.downloadFinished(this.value.result)
        }
    }
}

export class QueryMutation extends QueryDownload {
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache
    restoreAfterRestart = true
    autoDownload = false

    @computed get cacheKey() {
        return 'DO_NOT_CACHE'
    }
}

export class FeedDownload extends QueryDownload {
    cacheInfo = config.defaultRefreshCacheInfo

    refresh = async () => {
        log("REFRESHING FEED:", this.name, this.errorAttempts)

        transaction(() => {
            this.downloadStarted()
            this.onStart()
            if (this.refreshStateChanged) {
                /* lastValue and _message have become stale, clear them */
                this.lastValue = null
                this._message  = null
            }
            this.lastRefreshState = this.refreshState
        })

        /* Establish feed */
        downloadManager.feed(
            this.name,              /* messageID */
            this.query,             /* query */
            async (value) => {      /* onReceive */
                this.onReceive(value)
                await cache.set(this.cacheKey, value, this.cacheInfo)
            },
            this.onError,           /* onError */
        )

        /* In the meantime, load cache entry */
        const cacheEntry = await this.cache.get(
            this.cacheKey,
            () => null, /* refreshCallback */
            () => null, /* expiredCallback */
            cacheInfo,
        )
        if (this.value == null && this.lastValue == null) {
            this.onReceive(cacheEntry.value)
        }
    }

    @action onReceive = (value) => {
        this.downloadFinished(value)
        this.finish()
    }

    @action onError = (message) => {
        this.downloadError(message)
    }
}

export class FeedMutation extends FeedDownload {
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache
    restoreAfterRestart = true
    autoDownload = false

    @computed get cacheKey() {
        return 'DO_NOT_CACHE'
    }
}

export const latest = (d1, d2) => {
    if (d1.state !== 'Finished' || !d1.timestamp)
        return d2
    if (d2.state !== 'Finished' || !d2.timestamp)
        return d1
    if (d1.timestamp > d2.timestamp)
        return d1
    else
        return d2
}

class Ticker {
    @observable now = getTime()
}

export const ticker = new Ticker()

/* Update ticker every 5s */
const updateTicker = () => {
    ticker.now = getTime()
    setTimeout(updateTicker, 5000)
}

updateTicker()

/*********************************************************************/
/* Download Manager */
/*********************************************************************/

type TimeoutDesc =
    | 'short'
    | 'normal'
    | 'long'

type TimeoutInfo = {
    timeoutDesc: ?TimeoutDesc,
    refreshTimeout: ?Float,
    expiredTimeout: ?Float,
}

type FetchOptions<T> = {
    /* key used for caching responses */
    key: String,
    /* URL to fetch */
    url: URL,
    /* HTTP options to pass to fetch() */
    httpOptions: HTTPOptions,
    cacheInfo: CacheInfo,
    timeoutInfo: TimeoutInfo,
    processValue: (value : T) => T,
    acceptValueFromCache: (value : T) => Bool,
}

const getTimeoutInfo = (timeoutInfo : TimeoutInfo) : TimeoutInfo => {
    if (timeoutInfo.refreshTimeout && timeoutInfo.expiryTimeout)
        return timeoutInfo

    const { timeoutDesc } = timeoutInfo
    if (timeoutDesc === 'short')
        return {
            timeoutDesc: 'short',
            refreshTimeout: 6000,
            expiryTimeout:  9000,
        }
    if (timeoutDesc === 'normal')
        return {
            timeoutDesc: 'normal',
            refreshTimeout: 10000,
            expiryTimeout:  20000,
        }
    if (timeoutDesc === 'long')
        return {
            timeoutDesc: 'long',
            refreshTimeout: 12000,
            expiryTimeout:  25000,
        }
}


class DownloadManager {

    @observable downloadNames = []
    @observable downloads = {}
    @observable refreshing = false

    constructor() {
        this._initialized = false
        this.disposeHandlers = {}
        this.downloadStatesToRestore = {}
        this.queryTransport = new QueryTransport(WebSocketHOST)
    }

    @computed get connected() {
        return this.queryTransport.connected
    }

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    @computed get downloadStates() {
        const downloadStatesToRestore = {}
        this.downloadList.forEach(download => {
            if (download.restoreAfterRestart) {
                downloadStatesToRestore[download.name] = download.getState()
            }
        })
        return downloadStatesToRestore
    }

    getState = () => {
        return {
            downloadStates: this.downloadStates,
        }
    }

    emptyState = () => {
        return {
            downloadStates: [],
        }
    }

    setState = (downloadManagerState) => {
        this.downloadStatesToRestore = downloadManagerState.downloadStates
    }

    initialized = () => {
        this.downloadList.forEach(this.initializeDownload)
        this.queryTransport.tryConnect()
        this._initialized = true
    }

    /*********************************************************************/
    /* Download Management                                               */
    /*********************************************************************/

    @computed get downloadList() {
        return this.downloadNames.map(name => this.downloads[name])
    }

    declareDownload = (download) => {
        assert(download.name != null,
               `Download.name is null (${download.name})`)
        assert(this.downloads[download.name] == undefined,
               `Download.name already defined (${download.name})`)

        /* Save and initialize the download */
        this.downloads[download.name] = download
        this.downloadNames.push(download.name)
        if (this._initialized)
            this.initializeDownload(download)
    }

    initializeDownload = (download) => {
        this.restoreDownload(download)
        this.autoDownload(download)
    }

    /* Restore the download state after e.g. an app restart.
       This is useful for http post/mutations that bypass the cache.
     */
    restoreDownload = (download) => {
        const downloadState = this.downloadStatesToRestore[download.name]
        if (downloadState != undefined && download.restoreAfterRestart) {
            download.setState(downloadState)
        }
    }

    autoDownload = (download) => {
        /* Refresh download when necessary */
        if (!download.autoDownload)
            return

        this.disposeHandlers[download.name] = autorun(() => {
            if (download.shouldRefreshNow) {
                download.refresh()
            }
        })
    }

    removeDownload = (name) => {
        delete this.downloads[name]
        this.downloadNames = this.downloadNames.filter(n => n != name)
        /* Dispose of autorun that re-triggers download */
        this.disposeHandlers[name]()
        delete this.disposeHandlers[name]
    }

    forceRefresh = async (name) => {
        await this.getDownload(name).forceRefresh()
    }

    getDownload = (name) => {
        const download = this.downloads[name]
        if (download == null)
            throw Error(`No download with name ${name}`)
        return download
    }

    /*********************************************************************/
    /* Actions                                                           */
    /*********************************************************************/

    /* Refresh errored downloads, e.g. after re-gaining connectivity */
    refreshDownloads = async () => {
        this.refreshing = true
        await Promise.all(
            this.downloadList.map(async (download) => {
                if (download.state === 'Error') {
                    await download.forceRefresh()
                }
                download.resetErrorAttempts()
            })
        )
        this.refreshing = false
    }

    /*********************************************************************/
    /* Helper functions                                                  */
    /*********************************************************************/

    fetch = (fetchOptions) => {
        const { url, httpOptions } = fetchOptions
        fetchOptions.fetch = (timeout) => simpleFetch(url, httpOptions, timeout)
        return fetchWithTimeouts(fetchOptions)
    }

    query = (messageID, fetchOptions) => {
        return fetchWithTimeouts({
            ...fetchOptions,
            fetch: (timeout) => {
                const request = {
                    messageID: messageID,
                    type: 'query',
                    query: fetchOptions.query,
                }
                return this.queryTransport.fetch(request, timeout)
            },
        })
    }

    feed = (messageID, query, onReceive, onError) => {
        const timeout = getTimeoutInfo({timeoutDesc: 'normal'})
        const request = {
            messageID: messageID,
            type: 'feed',
            query: query,
        }
        this.queryTransport.feed({
            request,
            resolve: _.timeoutCallback(timeout.refreshTimeout, onReceive, onError),
        })
    }
}

export const downloadManager = new DownloadManager()

const isNetworkError = (e : Error) : boolean =>
    e instanceof NetworkError || e instanceof _.TimeoutError

const fetchWithTimeouts = async ({
        key, fetch, timeoutInfo, cacheInfo,
        processValue, acceptValueFromCache,
        }) : Promise<T> => {

    const _fetchNow = async (timeout : Float) => {
        return processValue(await fetch(timeout))
    }

    timeoutInfo = getTimeoutInfo(timeoutInfo)
    const refreshCallback = () => _fetchNow(timeoutInfo.refreshTimeout)
    const expiredCallback = () => _fetchNow(timeoutInfo.expiredTimeout)

    var result
    try {
        if (cacheInfo && (cacheInfo.noCache || cacheInfo.getFromCache === false)) {
            result = await refreshCallback()
            if (!cacheInfo.noCache) {
                /* TODO: Make sure getFromCache is set by all callers */
                cache.set(key, result, cacheInfo)
            }
        } else {
            const cachedValue = await cache.get(key, refreshCallback, null, cacheInfo)
            if (cachedValue.fromCache && !acceptValueFromCache(cachedValue.value)) {
                /* Do not accept value from cache (e.g. due to incomplete/erroroneous download */
                result = await refreshCallback()
                cache.set(key, result, cacheInfo)
            } else {
                result = cachedValue.value
            }
        }
        return emptyResult().downloadFinished(result)
    } catch (e) {
        if (isNetworkError(e))
            return emptyResult().downloadError(e.message)
        throw e
    }
}

export const simpleFetch = async /*<T>*/(
        url             : URL,
        httpOptions     : HTTPOptions,
        downloadTimeout : Float,
        ) : Promise<T> => {
    let response : Response
    httpOptions = httpOptions || {}
    httpOptions['Accept-Encoding'] = 'gzip,deflate'
    // log("FETCHING", url, httpOptions && httpOptions.body)
    try {
        const fetchPromise : Promise<Response> = fetch(url, httpOptions)
        response = await _.timeout(downloadTimeout, fetchPromise)
        // response = await fetch(url, httpOptions)
    } catch (err) {
        throw new NetworkError(err.message)
    }
    if (response.status !== 200) {
        throw new NetworkError("Network Error", response.status)
    }
    return await response.text()
}
