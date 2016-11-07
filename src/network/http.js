import { observable, transaction, computed, action, autorun } from 'mobx'

import { Cache, cache } from './cache.js'
import { config } from '/utils/config.js'
import { HOST } from './host.js'
import { getTime, Second, Minute } from '/utils/time.js'
import * as _ from '/utils/curry.js'

import type { Int, Float, String, URL } from '/utils/types.js'

const { log, assert } = _.utils('/network/http.js')

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

    constructor(getProps) {
        /* function returning props derived from a (observable) model state */
        this.getProps = getProps
    }

    @computed get props() {
        return this.getProps()
    }

    @computed get active() {
        return true
    }

    @computed get cacheKey() {
        throw Error("Cache key not implemented")
    }

    @computed get url() {
        return null
    }

    @computed get httpOptions() {
        return null
    }

    /* Refresh the download whenever 'url' or 'httpOptions' change */
    @computed get refreshState() {
        return {
            url: this.url,
            httpOptions: this.httpOptions,
        }
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
        log("REFRESHING.............", this.name, this.errorAttempts)
        const refreshState = this.refreshState

        // Update timestamp
        transaction(() => {
            this.downloadStarted()
            this.timestamp = getTime()
            if (this.refreshStateChanged) {
                /* lastValue and _message have become stale, clear them */
                this.lastValue = null
                this._message  = null
            }
            this.lastRefreshState = refreshState
        })

        // Download
        cacheInfo = cacheInfo || this.cacheInfo
        const promise = downloadManager.fetch(
            this.cacheKey,
            this.url,
            this.httpOptions,
            cacheInfo,
            this.timeoutDesc,
            this.acceptValueFromCache,
        )
        this.promise = promise
        const downloadResult = await promise

        if (!_.deepEqual(refreshState, this.refreshState)) {
            // Result from an out-of-date download -- do not use
            return
        }
        transaction(() => {
            // Update state
            if (downloadResult.state === 'Finished') {
                this.downloadFinished(downloadResult.value)
                this.finish()
            } else if (downloadResult.state === 'Error') {
                this.downloadError(downloadResult.message)
            } else {
                throw Error(`Invalid download state: ${downloadResult.state}`)
            }
        })
    }

    finish() {
        /*
        Update the download state here for any finished download

            Must use non-lambda functions, otherwise overriding and super()
            do not work. Broken stupid shit.
        */
    }

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
        this.value   = null
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

export class JSONDownload extends Download {
    finish() {
        super.finish()
        if (this.value != null) {
            this.value = parseJSON(this.value)
        }
    }
}

export class QueryDownload extends JSONDownload {
    @computed get url() {
        return HOST + '/api/v1/'
    }

    @computed get httpOptions() {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.query),
        }
    }

    @computed get query() {
        return null
    }

    acceptValueFromCache = (value) => {
        return value.result && !value.error
    }

    finish() {
        /* Unpack the queries result value or error message */
        super.finish()
        if (this.value && this.value.error)
            this.downloadError(this.value.error)
        else if (this.value)
            this.downloadFinished(this.value.result)
    }
}

/* TODO: Re-use properties */
export class JSONMutation extends JSONDownload {
    cacheInfo = config.noCache
    refreshCacheInfo = config.noCache
    restoreAfterRestart = true
    autoDownload = false

    @computed get cacheKey() {
        return 'DO_NOT_CACHE'
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

const getTimeoutInfo = (timeoutDesc) => {
    if (timeoutDesc === 'short')
        return {
            refreshTimeout: 6000,
            expiryTimeout:  9000,
        }
    if (timeoutDesc === 'normal')
        return {
            refreshTimeout: 10000,
            expiryTimeout:  20000,
        }
    if (timeoutDesc === 'long')
        return {
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

    queryMutate = async (query) => {
        return await this.query(
            'DO_NOT_CACHE',
            query,
            { noCache: true },
        )
    }

    query = async (
            /* key used for caching responses */
            key : string,
            /* GraphQL query string to execute */
            query : 'object',
            /* Callback that decides whether the download is still relevant */
            cacheInfo    : CacheInfo,
            timeoutDesc = 'normal',
            ) => {
        assert(typeof(query) == 'object', typeof(query))
        const httpOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        }
        const downloadResult = await this.fetchJSON(
            key,
            HOST + '/api/v1/',
            httpOptions,
            cacheInfo,
            timeoutDesc,
            acceptValueFromCache = (value) => {
                return value.result && !value.error
            },
        )
        const value = downloadResult.value
        if (value && value.error) {
            /* GraphQL error */
            const errorMessage = value.error
            return downloadResult.downloadError(errorMessage)
        }

        return downloadResult.update(value => value.result)
    }

    fetchJSON = async (
            /* key used for caching responses */
            key : string,
            /* URL to fetch */
            url : URL,
            /* HTTP options to pass to fetch() */
            httpOptions : HTTPOptions,
            cacheInfo : CacheInfo,
            timeoutDesc = 'normal',
            acceptValueFromCache = (value) => true,
            ) => {
        const downloadResult : DownloadResult<String> = await this.fetch(
            key,
            url,
            httpOptions,
            cacheInfo,
            timeoutDesc,
            acceptValueFromCache,
        )
        if (downloadResult.value) {
            downloadResult.update(parseJSON)
        }
        return downloadResult
    }

    /* HTTP GET/POST/etc to a URL */
    fetch = async /*<T>*/(
            /* key used for caching responses */
            key : string,
            /* URL to fetch */
            url : URL,
            /* HTTP options to pass to fetch() */
            httpOptions : HTTPOptions,
            cacheInfo : CacheInfo,
            timeoutDesc = 'normal',
            acceptValueFromCache = (value) => true,
        ) : Promise<DownloadResult<T>> => {
        assert(url)
        /* Try a fresh download... */
        const timeoutInfo = getTimeoutInfo(timeoutDesc)
        return await fetchWithTimeouts(
            key, url, httpOptions,
            timeoutInfo.refreshTimeout,
            timeoutInfo.expiryTimeout,
            cacheInfo,
            acceptValueFromCache = acceptValueFromCache,
        )
    }

}

export const downloadManager = new DownloadManager()

const isNetworkError = (e : Error) : boolean =>
    e instanceof NetworkError || e instanceof _.TimeoutError

const fetchWithTimeouts = async /*<T>*/(
        key             : string,
        url             : URL,
        httpOptions     : HTTPOptions,
        refreshTimeout  : Float,
        expiredTimeout  : Float,
        cacheInfo       : CacheInfo,
        acceptValueFromCache = (value) => true,
        ) : Promise<DownloadResult<T>> => {

    const refreshCallback = async () => {
        return await simpleFetch(url, httpOptions, refreshTimeout)
    }
    const expiredCallback = async () => {
        return await simpleFetch(url, httpOptions, expiredTimeout)
    }

    let result
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

const parseJSON = (text) => {
    // Avoid JSON.parse() bug, see https://github.com/facebook/react-native/issues/4961
    return JSON.parse(text.replace( /\\u2028|\\u2029/g, ''))
}
