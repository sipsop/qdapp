import {
    React,
    Component,
    ActivityIndicator,
    View,
    TouchableOpacity,
    StyleSheet,
    PureComponent,
    T,
} from '/components/Component.js';
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { Notification } from '../notification/Notification'
import { Loader } from '../Page.js'
import * as _ from '/utils/curry.js'
import { downloadManager } from '/network/http'
import { config } from '/utils/config.js'

const { log, assert } = _.utils('/components/download/DownloadResultView')

const styles = StyleSheet.create({
    inProgress: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        margin: 5,
        borderRadius: 10,
        padding: 5,
    },
    errorRefresh: {
        padding: 5,
    },
    errorText: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
    },
    errorRefreshText: {
        fontSize: 22,
        color: config.theme.primary.medium,
    },
})


/* React Component for rendering a downloadResult in its different states */
@observer
export class DownloadResultView<T> extends PureComponent {
    /* properties:
        getDownloadResult: ?() => DownloadResult<T>
        refreshPage: ?() => void
        renderFinished: ?(T) => Component
    */

    inProgressMessage = null

    /* If true (default), then whenever getDownloadResult().lastValue != null,
       we call renderFinished() even if the download is in an error state or
       is in progress.
    */
    finishOnLastValue = true

    /* If true (default), show the last error message for the download while
       the download is in progress.
    */
    showLastErrorMessage = true

    /* Override default error message */
    errorMessage      = null

    render = () => {
        const res = this.getDownloadResult()
        assert(res != null, `Got null DownloadResult in component with error message "${this.errorMessage}"`)
        const finished = this.finishOnLastValue && res.lastValue != null
        const haveError =
            this.showLastErrorMessage &&
            res.state === 'InProgress' &&
            res.haveErrorMessage

        if (res.state === 'NotStarted') {
            return this.renderNotStarted()
        } else if (res.state === 'Finished' || finished) {
            return this.renderFinished(res.lastValue)
        } else if (res.state === 'Error' || haveError) {
            return this.renderError(res.message)
        } else if (res.state === 'InProgress') {
            return this.renderInProgress()
        } else {
            throw Error('unreachable')
        }
    }

    getDownloadResult = () => {
        if (this.props.getDownloadResult)
            return this.props.getDownloadResult()
        throw Error('NotImplemented')
    }

    refreshPage = async () => {
        if (this.props.refreshPage)
            this.props.refreshPage()
        else
            await downloadManager.refreshDownloads()
    }

    renderNotStarted = () => null

    renderFinished = (value : T) => {
        if (this.props.renderFinished)
            return this.props.renderFinished(value)
        throw Error('NotImplemented')
    }

    renderInProgress = () => {
        return <View style={styles.inProgress}>
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

    renderError = (errorMessage : string) => {
        return (
            <View style={styles.error}>
                <T style={styles.errorText}>
                    {this.errorMessage || errorMessage}
                </T>
                {
                    this.getDownloadResult().state === 'InProgress'
                        ? <Loader />
                        : <TouchableOpacity onPress={this.refreshPage}>
                            <View style={styles.errorRefresh}>
                                <T style={styles.errorRefreshText}>
                                    REFRESH
                                </T>
                            </View>
                        </TouchableOpacity>
                }
            </View>
        )
    }
}
