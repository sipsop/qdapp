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
import * as _ from './Curry.js'

import type { Int, Float, String, URL } from './Types.js'

const { log, assert } = _.utils('./HTTP.js')

/*********************************************************************/

export type HTTPOptions = RequestOptions

/*********************************************************************/
export var HOST : String
HOST = 'http://192.168.0.6:5000'
// HOST = 'http://192.168.0.28:5000'
// HOST = 'http://172.24.176.169:5000'
// HOST = 'http://localhost:5000/graphql'
// HOST = 'http://10.147.18.19:5000'

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
        if (downloadState.state === 'InProcess') {
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
        throw Error('NotImplemented')
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

export const graphQLArg = (obj) => {
    if (typeof(obj) === 'number') {
        return JSON.stringify(obj)
    } else if (typeof(obj) === 'string') {
        return JSON.stringify(obj)
    } else if (Array.isArray(obj)) {
        const items = obj.map(graphQLArg).join(', ')
        return `[ ${items} ]`
    } else if (typeof(obj) === 'object') {
        const fields = Object.keys(obj).map(key => {
            const value = graphQLArg(obj[key])
            return `${key}: ${value}`
        }).join(', ')
        return `{ ${fields} }`
    } else {
        throw Error(`Unknown type: ${typeof(obj)}`)
    }
}

class DownloadManager {

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
            ) => { //: Promise<DownloadResult<T>> => {
        const httpOptions = {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json',
                'Content-Type': 'application/graphql',
            },
            body: query,
        }
        const result = await this.fetchJSON(key, HOST + '/graphql', httpOptions, cacheInfo)
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
        ) : Promise<DownloadResult<T>> => {
        assert(url)
        /* Try a fresh download... */
        return await fetchJSONWithTimeouts(key, url, httpOptions, 12000, 20000, cacheInfo)
    }

}

export const downloadManager = new DownloadManager()

const fetchJSON = async /*<T>*/(
        key : string,
        url : URL,
        httpOptions : HTTPOptions,
        cacheInfo   : CacheInfo,
        ) : Promise<DownloadResult<T>> => {
    return await fetchJSONWithTimeouts(key, url, httpOptions, 5000, 12000, cacheInfo)
}

const isNetworkError = (e : Error) : boolean =>
    e instanceof NetworkError || e instanceof _.TimeoutError

const fetchJSONWithTimeouts = async /*<T>*/(
        key             : string,
        url             : URL,
        httpOptions     : HTTPOptions,
        refreshTimeout  : Float,
        expiredTimeout  : Float,
        cacheInfo       : CacheInfo,
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
        if (cacheInfo && cacheInfo.noCache) {
            result = await refreshCallback()
        } else {
            result = await cache.get(key, refreshCallback, /*expiredCallback, */ cacheInfo = cacheInfo)
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
