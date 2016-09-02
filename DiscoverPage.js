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
    constructor(props) {
        super(props, "Error downloading list of bars:")
    }

    refreshPage = store.initialize
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()
    renderNotStarted  = () => <View />

    renderFinished = searchResponse => {
        const barList = mapStore.nearbyBarList || []
        return <DiscoverView barList={barList} />
    }
}

@observer
export class DiscoverView extends PureComponent {
    /* properties:
        barList: [schema.Bar]
    */

    constructor(props) {
        super(props)
        this.ds = new ListView.DataSource({
            rowHasChanged: (i, j) => i !== j,
        })
    }

    saveScrollView = (scrollview) => {
        store.discoverScrollView = scrollview
    }

    @computed get rowNumbers() {
        return _.range(1 + this.props.barList.length)
    }

    @computed get dataSource() {
        return this.ds.cloneWithRows(this.rowNumbers)
    }

    render = () => {
        return <ListView
                    ref={this.saveScrollView}
                    dataSource={this.dataSource}
                    renderRow={this.renderRow}
                    />
    }

    renderRow = (i) => {
        log("rendering row", i)
        if (i === 0)
            return <MapView key='mapview' />
        return this.renderBarCard(i - 1)
    }

    renderBarCard = (i) => {
        const bar = this.props.barList[i]
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
