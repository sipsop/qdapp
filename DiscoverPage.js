import {
    React,
    Component,
    View,
    ScrollView,
    ListView,
    PureComponent,
} from './Component.js'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import { MapView } from './Maps/MapView.js'
import { DiscoverBarCard } from './Bar/BarCard.js'
import { DownloadResultView } from './HTTP.js'
import { T } from './AppText.js'
import { store, barStore, mapStore } from './Store.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

const log = _.logger('DiscoverPage.js')

@observer
export class DiscoverPage extends DownloadResultView {
    errorMessage      = "Error downloading list of bars"
    refreshPage       = store.initialize
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()
    renderNotStarted  = () => <View />

    renderFinished = searchResponse => {
        return <DiscoverView />
    }
}

@observer
export class DiscoverView extends Page {
    constructor(props) {
        super(props)
        this.ds = new ListView.DataSource({
            rowHasChanged: (i, j) => true, // i !== j,
        })
    }

    saveScrollView = (scrollview) => {
        store.discoverScrollView = scrollview
    }

    @computed get rows() {
        const mapValue = [-1, null]
        const barList = mapStore.nearbyBarList.map((bar, i) => [i, bar])
        barList.unshift(mapValue)
        return barList
    }

    @computed get dataSource() {
        return this.ds.cloneWithRows(this.rows)
    }

    renderView = () => {
        return <View style={{flex: 1, marginBottom: 5}}>
            <ListView
                ref={this.saveScrollView}
                dataSource={this.dataSource}
                renderRow={this.renderRow}
                />
        </View>
    }

    renderRow = (value) => {
        const [i, bar] = value
        if (i === -1)
            return <MapView key='mapview' />
        return this.renderBarCard(bar)
    }

    renderBarCard = (bar) => {
        return <DiscoverBarCard key={bar.id} bar={bar} imageHeight={200} />
    }
}
