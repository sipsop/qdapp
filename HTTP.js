import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { observable, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { Cache, cache } from './Cache.js'
import { LargeButton } from './Button.js'
import { PureComponent } from './Component.js'
import { config } from './Config.js'
import { store } from './Store.js'

const HOST = 'http://192.168.0.6:5000'
// const HOST = 'http://10.147.18.19:5000'

export class TimeoutError {
    constructor(message) {
        this.message = "Downloading is taking too long, please try again later."
    }
}

export class NetworkError {
    constructor(message) {
        this.message = message
    }
}

export class DownloadResult {
    // Download states
    static NotStarted   = 'NotStarted'  // download has not yet started
    static InProgress   = 'InProgress'  // download has started
    static Finished     = 'Finished'    // download is finished successfully
    static Error        = 'Error'       // download error

    // @observable state   = undefined
    // @observable message = undefined
    // @observable value   = undefined

    constructor() {
        this.state   = DownloadResult.NotStarted
        this.message = undefined
        this.value   = undefined
    }

    downloadStarted = () => {
        transaction(() => {
            this.state   = DownloadResult.InProgress
            this.message = undefined
            this.value   = undefined
        })
        return this
    }

    downloadError = (message) => {
        transaction(() => {
            this.state   = DownloadResult.Error
            this.message = message
            this.value   = undefined
        })
        return this
    }

    downloadFinished = (value) => {
        transaction(() => {
            this.state   = DownloadResult.Finished
            this.message = undefined
            this.value   = value
        })
        return this
    }

    update = (f) => {
        if (this.state == DownloadResult.Finished) {
            this.value = f(this.value)
        }
        return this
    }
}

export const emptyResult = () => new DownloadResult()

/* React Component for rendering a downloadResult in its different states */
@observer export class DownloadResultView extends PureComponent {
    /* props:
        downloadResult: DownloadResult
    */

    constructor(props, errorMessage) {
        super(props)
        if (!errorMessage)
            throw Error('Expected an error message as argument to DownloadResultView')
        this.errorMessage = errorMessage
    }

    render = () => {
        const res = this.getDownloadResult()
        if (res.state == DownloadResult.NotStarted) {
            return this.renderNotStarted()
        } else if (res.state == DownloadResult.InProgress) {
            return this.renderInProgress()
        } else if (res.state == DownloadResult.Finished) {
            return this.renderFinished(res.value)
        } else if (res.state == DownloadResult.Error) {
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

    renderFinished = (value) => {
        throw Error('NotImplemented')
    }

    renderInProgress = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
                animating={true}
                color={config.theme.primary.dark}
                size="large"
                />
        </View>

    renderError = (message) => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>{this.errorMessage}</Text>
            <Text style={{textAlign: 'center', marginBottom: 20}}>
                 {message}
            </Text>
            <LargeButton label="Refresh" onPress={this.refreshPage} />
        </View>
    }
}

/* Execute a GraphQL query */
export async function graphQL(query, key) {
    const httpOptions = {
        method: 'POST',
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/graphql',
        },
        body: query,
    }
    return await fetchJSON(key, HOST + '/graphql', httpOptions)
}

export async function fetchJSON(key, url, httpOptions) {
    return await fetchJSONWithTimeouts(key, url, httpOptions, 5000, 12000)
}

export async function fetchJSONWithTimeouts(
        key,
        url,
        httpOptions,
        refreshTimeout,
        expiredTimeout,
        ) {

    async function refreshCallback() {
        return await _fetchJSON(url, httpOptions, refreshTimeout)
    }
    async function expiredCallback() {
        return await _fetchJSON(url, httpOptions, expiredTimeout)
    }

    try {
        const result = await cache.get(key, refreshCallback, /*expiredCallback*/)
        return emptyResult().downloadFinished(result.data)
    } catch (e) {
        if (e instanceof NetworkError || e instanceof TimeoutError)
            return emptyResult().downloadError(e.message)
        console.error(e)
        return undefined
    }
}

async function _fetchJSON(url, httpOptions, downloadTimeout) {
    var response
    try {
        // TODO: Use timeout?
        // response = await timeout(downloadTimeout, () => fetch(url, httpOptions))
        response = await fetch(url, httpOptions)
    } catch (err) {
        throw new NetworkError(err.message)
    }
    if (response.status !== 200) {
        throw new NetworkError(response.statusText)
    }
    return await response.json()
}


/************/
/* Promises */
/************/

/* Set a timeout for an asynchronous callback */
export function timeout(timeout, callback) {
    async function runPromise(resolve, reject) {
        const flag = { done: false }

        /* Set timeout */
        setTimeout(() => {
            if (!flag.done)
                reject(new TimeoutError())
        }, timeout)

        /* Invoke callback and wait for result */
        try {
            const result = await callback()
            if (!flag.done) {
                resolve(result)
                flag.done = true
            }
        } catch (err) {
            flag.done = true
            reject(err)
        }
    }
    return new Promise(runPromise)
}

const promise = f => new Promise((resolve, reject) => {
    try {
        resolve(f())
    } catch (err) {
        reject(err)
    }
})
