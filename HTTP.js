import React, { Component } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { observable, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { config } from './Config.js'
import { store } from './Store.js'

const HOST = 'http://192.168.0.6:5000'

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
            <TouchableOpacity onPress={this.refreshPage}>
                <Text style={{fontSize: 20}}>Refresh</Text>
            </TouchableOpacity>
        </View>
    }
}

/* Execute a GraphQL query */
export const graphQL = (query) => {
    const httpOptions = {
        method: 'POST',
        headers: {
            // 'Accept': 'application/json',
            'Content-Type': 'application/graphql',
        },
        body: query,
    }
    return downloadJSON(HOST + '/graphql', httpOptions)
               .then((downloadResult) =>
                   downloadResult.update((data) => data.data)
               )
}

export const downloadJSON = (url, httpOptions) => {
    return fetch(url, httpOptions).then((response) => {
        if (response.status !== 200) {
            throw Error(response.statusText)
        }
        return response.json()
    }).then((jsonDoc) => {
        return emptyResult().downloadFinished(jsonDoc)
    })
}
