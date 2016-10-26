import {
    React,
    Component,
    ActivityIndicator,
    View,
    TouchableOpacity,
    StyleSheet,
    PureComponent,
    T,
} from '~/components/Component';
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from './DownloadResultView'
import { downloadManager, emptyResult } from '~/network/http'
import * as _ from '~/utils/curry'

export class DownloadComponent extends DownloadResultView {
    downloadName = null

    componentDidMount = () => {
        const download = this.getDownload()
        this.downloadName = download.name + '.' + _.uuid()
        download.name = this.downloadName
        downloadManager.declareDownload(download)
    }

    componentWillUnmount = () => {
        downloadManager.removeDownload(this.downloadName)
    }

    refreshPage = () => {
        downloaManager.forceRefresh(this.downloadName)
    }

    getDownloadResult = () => {
        if (!this.downloadName)
            return emptyResult()
        return downloadManager.getDownload(this.downloadName)
    }

    getDownload = () => {
        throw Error("getDownload() not implemented")
    }
}
