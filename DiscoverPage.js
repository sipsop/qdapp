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
import { BarCard } from './Bar/BarCard.js'
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
            rowHasChanged: (i, j) => i !== j,
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
        return <ListView
                    ref={this.saveScrollView}
                    dataSource={this.dataSource}
                    renderRow={this.renderRow}
                    />
    }

    renderRow = (value) => {
        const [i, bar] = value
        if (i === -1)
            return <MapView key='mapview' />
        return this.renderBarCard(bar)
    }

    renderBarCard = (bar) => {
        return <BarCard key={bar.id} bar={bar} />

        return (
            <ScrollView style={{flex: 1}} ref={this.saveScrollView}>
                <MapView />
                {/*
                <View style={{flex: 1}}>
                    <T style={
                            { marginLeft: 10
                            , fontSize: 20
                            , color: config.theme.primary.medium
                            }}>
                        Nearby Bars
                    </T>
                    */}
                {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
                {/*</View>*/}
            </ScrollView>
        )
    }
}
