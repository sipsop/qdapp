// flow

import {
    React,
    Component,
    ActivityIndicator,
    View,
    TouchableOpacity,
    StyleSheet,
    T,
} from './Component.js';
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Notification } from './Notification.js'
import { Cache, cache } from './Cache.js'
import { LargeButton } from './Button.js'
import { PureComponent } from './Component.js'
import { Loader } from './Page.js'
import { config } from './Config.js'
import { store } from './Store.js'
import { HOST } from './Host.js'
import { getTime, Second, Minute } from './Time.js'
import * as _ from './Curry.js'

import type { Int, Float, String, URL } from './Types.js'

const { log, assert } = _.utils('./HTTP.js')

/*********************************************************************/

export type HTTPOptions = RequestOptions

/*********************************************************************/

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

    constructor(errorMessage = "Error downloading some stuff...") {
        this.errorMessage = errorMessage
    }

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
        for (var i = 0; i < results.length; i++) {
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

export const emptyResult = <T>(errorMessage) : DownloadResult<T> => {
    return new DownloadResult(errorMessage)
}

/* React Component for rendering a downloadResult in its different states */
@observer
export class DownloadResultView<T> extends PureComponent {
    inProgressMessage = null
    errorMessage = null

    styles = StyleSheet.create({
        inProgress: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        error: {
            // flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            margin: 10,
            borderRadius: 5,
            padding: 5,
            // maxHeight: 150,
        },
    })

    render = () => {
        const res = this.getDownloadResult()
        assert(res != null, `Got null DownloadResult in component with error message "${this.errorMessage}"`)
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
        const downloadResult = this.getDownloadResult()
        if (downloadResult.refresh)
            downloadResult.refresh()
    }

    renderNotStarted = () => null
    renderFinished = (value : T) => {
        throw Error('NotImplemented')
    }

    renderInProgress = () => {
        return <View style={this.styles.inProgress}>
            {
                this.inProgressMessage
                    ? <T style={{fontSize: 20, color: '#000'}}>
                        {this.inProgressMessage}
                      </T>
                    : undefined
            }
            <View>
                <Loader />
            </View>
        </View>
    }

    formatErrorMessage = (message : String) => {
        const errorMessage = this.errorMessage || this.getDownloadResult().errorMessage
        message = message.strip()
        return this.getDownloadResult().errorMessage + (message ? ':\n' : '\n') + message
    }

    renderError = (message : string) => {
        const errorMessage = this.formatErrorMessage(message)
        return <Notification
                    dismissLabel="REFRESH"
                    onPress={this.refreshPage}
                    message={errorMessage}
                    textSize="medium"
                    absolutePosition={false} />
    }
}



export class JSONDownload {

    @observable state   : DownloadState = 'NotStarted'
    @observable message : ?string       = undefined
    @observable value   : ?T            = null
    @observable timestamp = null
    @observable errorAttempts : Int = 0
    @observable lastRefreshState = null

    errorMessage    : ?String = null
    periodicRefresh : ?Int = null           /* refresh every N seconds */
    depends         : Array<Download> = []  /* Download dependencies */
    active          : Bool = true
    cacheKey        : String = true
    httpOptions     = undefined
    url             = null

    /* Refresh downloads that had an error when connectivity resumes /
       user presses refresh
    */
    refreshOnError  = true

    /* How long results should be cached for */
    cacheInfo = config.defaultCacheInfo

    /* Cache info for forced refreshes */
    refreshCacheInfo = config.defaultRefreshCacheInfo

    /* How long before a download times out */
    timeoutDesc = 'normal'

    @computed get refreshState() {
        return null
    }

    /* Whether to cache the downloaded result */
    cacheResult = (result) => {
        return true
    }

    /***********************************************************************/
    /* Refresh                                                             */
    /***********************************************************************/

    @computed get _inProgress() {
        return this.inProgress && this.timestamp + 30 < ticker.now
    }

    /* Is the download outdated? */
    @computed get shouldRefresh() {
        const outdated = this.periodicRefresh &&
                         (this.timestamp + this.periodicRefresh < ticker.now)
        return outdated && !this._inProgress
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

    /* Have all download dependencies finished? */
    @computed get dependenciesFinished() {
        return _.all(this.depends.map(
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
    forceRefresh = (restartDownload = true) => {
        this.refresh(this.refreshCacheInfo, restartDownload)
    }

    /* Start download. Internal use only. */
    refresh = async (cacheInfo, restartDownload = true) => {
        // Update timestamp
        transaction(() => {
            if (restartDownload || this.state === 'NotStarted')
                this.downloadStarted()
            this.timestamp = getTime()
        })

        // Download
        cacheInfo = cacheInfo || this.cacheInfo
        const downloadResult = await downloadManager.fetchJSON(
            this.cacheKey,
            this.url,
            this.httpOptions,
            this.cacheInfo,
            this.timeoutDesc,
            this.acceptValueFromCache,
        )

        // Update state
        if (downloadResult.state === 'Finished')
            this.downloadFinished(downloadResult.value)
        else if (downloadResult.state === 'Error')
            this.downloadError(message)
        else
            throw Error(`Invalid download state: ${downloadResult.state}`)
    }

    /***********************************************************************/
    /* Download State                                                      */
    /***********************************************************************/

    @action reset = (state = 'NotStarted') : DownloadResult<T> => {
        this.state   = state
        this.message = null
        this.value   = null
        this.resetErrorAttempts()
        return this
    }

    @action resetErrorAttempts = () => {
        this.errorAttempts = 0
    }

    @action downloadStarted = () : DownloadResult<T> => {
        return this.reset('InProgress')
    }

    @action downloadError = (message : string) : DownloadResult<T> => {
        this.errorAttempts += 1
        this.state = 'Error'
        this.value = null
        this.message = message
        return this
    }

    @action downloadFinished = (value : T) : DownloadResult<T> => {
        this.reset('Finished')
        this.value = value
        return this
    }

    @computed get finished() {
        return this.state === 'Finished'
    }

    @computed get inProgress() {
        return this.state === 'InProgress'
    }
}

export class QueryDownload extends JSONDownload {
    url = HOST + '/api/v1/'

    get httpOptions() {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(thisquery),
        }
    }

    @computed get query() {
        return null
    }

    @computed get refreshState() {
        return this.query
    }

    acceptValueFromCache = (value) => {
        return value.result && !value.error
    }

    refresh = async (cacheInfo) => {
        const result = await JSONDownload.refresh.bind(this)(cacheInfo)
        if (this.value && this.value.error)
            this.downloadError(this.value.error)
        else if (this.value)
            this.downloadFinished(this.value.result)
    }
}

export class QueryMutation extends QueryDownload {
    cacheKey = 'DO_NOT_CACHE'
    cacheInfo = { noCache: true }
    refreshCacheInfo = { noCache: true }
    refreshOnError = false
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

    constructor() {
        this.downloads = []
    }

    declareDownload = (download) => {
        this.downloads.push(download)
        autorun(() => {
            if (download.shouldRefreshNow) {
                download.refresh()
            }
        })
    }

    /* Refresh errored downloads, e.g. after re-gaining connectivity */
    @action refreshDownloads = () => {
        this.downloads.forEach(download => {
            download.resetErrorAttempts()
        })
    }

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
        // log("SENDING QUERY", JSON.stringify(query))
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

    /* HTTP GET/POST/etc to a URL */
    fetchJSON = async /*<T>*/(
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
        return await fetchJSONWithTimeouts(
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

const fetchJSONWithTimeouts = async /*<T>*/(
        key             : string,
        url             : URL,
        httpOptions     : HTTPOptions,
        refreshTimeout  : Float,
        expiredTimeout  : Float,
        cacheInfo       : CacheInfo,
        acceptValueFromCache = (value) => true,
        ) : Promise<DownloadResult<T>> => {

    const refreshCallback = async () => {
        // log("Fetching new data....", key, url)
        return await simpleFetchJSON(url, httpOptions, refreshTimeout)
    }
    const expiredCallback = async () => {
        return await simpleFetchJSON(url, httpOptions, expiredTimeout)
    }

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

export const simpleFetchJSON = async /*<T>*/(
        url             : URL,
        httpOptions     : HTTPOptions,
        downloadTimeout : Float,
        ) : Promise<T> => {
    var response : Response
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
    // log("HTTP RESPONSE HEADERS", response.headers)
    // Avoid JSON.parse() bug, see https://github.com/facebook/react-native/issues/4961
    const jsonData = await response.text()
    // log("parsing json...")
    const result = JSON.parse(jsonData.replace( /\\u2028|\\u2029/g, ''))
    // log("done parsing json...")
    return result
    // return await response.json()
}
