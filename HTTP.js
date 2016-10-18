// flow

import {
    React,
    Component,
    ActivityIndicator,
    View,
    TouchableOpacity,
    T,
} from './Component.js';
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Cache, cache } from './Cache.js'
import { LargeButton } from './Button.js'
import { PureComponent } from './Component.js'
import { Loader } from './Page.js'
import { config } from './Config.js'
import { store } from './Store.js'
import { HOST } from './Host.js'
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

    @action reset = () : DownloadResult<T> => {
        this.state = 'NotStarted'
        this.message = undefined
        this.value = undefined
        return this
    }

    @action downloadStarted = () : DownloadResult<T> => {
        this.state   = 'InProgress'
        this.message = undefined
        this.value   = undefined
        return this
    }

    @action downloadError = (message : string) : DownloadResult<T> => {
        this.state   = 'Error'
        this.message = message
        this.value   = undefined
        return this
    }

    @action downloadFinished = (value : T) : DownloadResult<T> => {
        this.state   = 'Finished'
        this.message = undefined
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

    @observable downloadResults : Array<DownloadResult> = null

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

    @computed get message() {
        const results = this.downloadResults
        for (var i = 0; i < results.length; i++) {
            if (results[i].state === 'Error')
                return results[i].message
        }
        return undefined
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

export const emptyResult =
    <T>() : DownloadResult<T> => new DownloadResult()

/* React Component for rendering a downloadResult in its different states */
@observer
export class DownloadResultView<T> extends PureComponent {
    /* props:
        downloadResult: DownloadResult
    */

    inProgressMessage = null
    errorMessage = null

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
        return <View />
        // throw Error('NotImplemented')
    }

    renderFinished = (value : T) => {
        throw Error('NotImplemented')
    }

    renderInProgress = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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

    renderError = (message : string) => {
        assert(this.errorMessage != null,
               "Expected errorMessage to be set in DownloadResultView")
        const errorMessage = this.errorMessage + (message ? ': ' : '')
        const errorTextStyle = {
            fontSize: 20,
            color: config.theme.primary.dark,
            // color: config.theme.removeColor,
            textAlign: 'center',
        }
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <T style={errorTextStyle}>{this.errorMessage}</T>
            { message
                ? <T style={errorTextStyle}>{message}</T>
                : undefined
            }
            <LargeButton
                style={{marginTop: 20}}
                label="Refresh"
                onPress={this.refreshPage}
                />
        </View>
    }
}

export const graphQLArg = (obj) => _graphQLArg(_.asData(obj))

const _graphQLArg = (obj) => {
    if (obj == null) {
        return obj
    } else if (typeof(obj) === 'number') {
        return JSON.stringify(obj)
    } else if (typeof(obj) === 'string') {
        return JSON.stringify(obj)
    } else if (Array.isArray(obj)) {
        const items = obj.map(_graphQLArg).join(', ')
        return `[ ${items} ]`
    } else if (typeof(obj) === 'object') {
        const fields = Object.keys(obj).map(key => {
            const value = _graphQLArg(obj[key])
            return `${key}: ${value}`
        }).join(', ')
        return `{ ${fields} }`
    } else {
        throw Error(`Unknown type: ${typeof(obj)}`)
    }
}


const getTimeoutInfo = (timeoutDesc) => {
    if (timeoutDesc === 'short')
        return {
            refreshTimeout: 3000,
            expiryTimeout:  8000,
        }
    if (timeoutDesc === 'normal')
        return {
            refreshTimeout: 9000,
            expiryTimeout:  18000,
        }
    if (timeoutDesc === 'long')
        return {
            refreshTimeout: 12000,
            expiryTimeout:  25000,
        }
}

class DownloadManager {

    queryMutate = async (query) => {
        return await this.query('DO_NOT_CACHE', query, { noCache: true })
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
        log("SENDING QUERY", JSON.stringify(query))
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
            }
        )
        const value = downloadResult.value
        if (value && value.error) {
            /* GraphQL error */
            const errorMessage = value.error
            return downloadResult.downloadError(errorMessage)
        }

        return downloadResult.update(value => value.result)
    }

    graphQLMutate = async (query) => {
        return await this.graphQL('DO_NOT_CACHE', query, { noCache: true })
    }

    /* Execute a GraphQL query */
    graphQL = async /*<T>*/(
            /* key used for caching responses */
            key : string,
            /* GraphQL query string to execute */
            query : string,
            /* Callback that decides whether the download is still relevant */
            cacheInfo    : CacheInfo,
            timeoutDesc = 'normal',
            ) => { //: Promise<DownloadResult<T>> => {
        const httpOptions = {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/graphql',
            },
            body: query,
        }
        const result = await this.fetchJSON(
            key, HOST + '/graphql', httpOptions, cacheInfo, timeoutDesc)
        const value = result.value
        if (value && value.errors && value.errors.length > 0) {
            /* GraphQL error */
            const errorMessage = value.errors[0].message
            return result.downloadError(errorMessage)
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
        return new DownloadResult().downloadFinished(result)
    } catch (e) {
        if (isNetworkError(e))
            return new DownloadResult().downloadError(e.message)
        throw e
    }
}

export const simpleFetchJSON = async /*<T>*/(
        url             : URL,
        httpOptions     : HTTPOptions,
        downloadTimeout : Float,
        ) : Promise<T> => {
    var response : Response
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
    return await response.json()
}
