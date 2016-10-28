import {
    React,
    Component,
    ActivityIndicator,
    View,
    TouchableOpacity,
    StyleSheet,
    PureComponent,
    T,
} from '~/src/components/Component.js';
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { Notification } from '../Notification.js'
import { Loader } from '../Page.js'
import * as _ from '~/src/utils/curry.js'

const { log, assert } = _.utils('~/src/components/download/DownloadResultView')


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
        } else if (res.state == 'Finished' || (res.autoDownload && res.lastValue != null)) {
            return this.renderFinished(res.lastValue)
        } else if (res.state == 'InProgress') {
            return this.renderInProgress()
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
        message = message && '\n' + message.strip()
        return errorMessage + (message ? ':\n' + message : '')
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
