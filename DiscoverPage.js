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
import { Descriptor, SimpleListView } from './SimpleListView.js'
import { T } from './AppText.js'
import { store, barStore, mapStore } from './Store.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

const log = _.logger('DiscoverPage.js')

@observer
export class DiscoverPage extends DownloadResultView {
    errorMessage      = "Error downloading list of bars"
    refreshPage       = mapStore.updateNearbyBars
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()
    renderNotStarted  = () => <View />

    renderFinished = searchResponse => {
        return <DiscoverView />
    }
}

class DiscoverViewDescriptor extends Descriptor {
    get numberOfRows() {
        return mapStore.nearbyBarList.length
    }

    renderHeader = () => <MapView key='mapview' />

    renderRow = (i) => {
        const bar = mapStore.nearbyBarList[i]
        return <DiscoverBarCard
                    key={bar.id}
                    bar={bar}
                    imageHeight={190} />
    }
}

const discoverViewDescriptor = new DiscoverViewDescriptor()

@observer
// export class DiscoverView extends Page {
export class DiscoverView extends PureComponent {
    saveScrollView = (scrollview) => {
        store.discoverScrollView = scrollview
    }

    @computed get key() {
        const key = mapStore.getCurrentMarker() && mapStore.getCurrentMarker().id
        return key || 'barCardList'
    }

    // renderView = () => {
    render = () => {
        log("RENDERING DISCOVER PAGE")
        return <View style={{flex: 1, marginBottom: 5}}>
            <SimpleListView
                /* key={this.key} */
                getRef={this.saveScrollView}
                descriptor={discoverViewDescriptor}
                initialListSize={2}
                pageSize={2}
                />
        </View>
    }
}
