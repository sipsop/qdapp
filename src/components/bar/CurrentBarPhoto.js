import { React, Component, View } from '/components/Component.js';
import { observable, transaction, computed, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from '../download/DownloadResultView'
import { LazyBarPhoto } from './LazyBarPhoto'

import { barStore } from '/model/store'

@observer
export class CurrentBarPhoto extends DownloadResultView {
    /* properties:
        onBack: ?() => void

    Render the current bar photo, or an error in case the bar's info couldn't
    be downloaded.
    */
    getDownloadResult = barStore.getBarDownloadResult
    renderFinished = (bar) => {
        return (
            <LazyBarPhoto
                bar={bar}
                photo={bar.photos[0]}
                imageHeight={150}
                showBackButton={this.props.onBack != null}
                onBack={this.props.onBack}
                />
        )
    }
}
