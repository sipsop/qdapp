import {
    React,
    Component,
    View,
    ScrollView,
    ListView,
    PureComponent,
    StyleSheet,
} from './Component.js'
import { computed, observable } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import { MapView } from './Maps/MapView.js'
import { DiscoverBarCard } from './Bar/BarCard.js'
import { DownloadResultView } from './HTTP.js'
import { Header, TextHeader } from './Header.js'
import { SelectableButton } from './ButtonRow.js'
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

    // renderHeader = () => <MapView key='mapview' />

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
export class DiscoverView extends Page {
// export class DiscoverView extends PureComponent {

    @computed get key() {
        const key = mapStore.getCurrentMarker() && mapStore.getCurrentMarker().id
        return key || 'barCardList'
    }

    showMap = () => store.setMapVisible(true)
    showNearby = () => store.setMapVisible(false)

    renderView = () => {
    // render = () => {
        return <View style={{flex: 1, marginBottom: 5}}>
            <Header style={{flexDirection: 'row' /*, backgroundColor: '#000' */}}
                    primary={this.props.primary}>
                <SelectableButton
                    label='Map'
                    onPress={this.showMap}
                    active={store.mapVisible}
                    disabled={store.mapVisible} /* disable active buttons */
                    style={{flex: 1}}
                    />
                <SelectableButton
                    label='Nearby'
                    onPress={this.showNearby}
                    active={!store.mapVisible}
                    disabled={!store.mapVisible} /* disable active buttons */
                    style={{flex: 1}}
                    />
            </Header>
            {store.mapVisible && <MapPage />}
            {!store.mapVisible && <BarListPage />}
        </View>
    }
}

@observer
// class MapPage extends Page {
class MapPage extends PureComponent {
    styles = StyleSheet.create({
        view: {
            flex: 1,
        },
    })

    // renderView = () => {
    render = () => {
        const bar = mapStore.getCurrentMarker()
        return <View style={{flex: 1}}>
            <MapView key='mapView' />
            { bar &&
                <DiscoverBarCard
                    key={bar.id}
                    bar={bar}
                    imageHeight={190}
                    showMapButton={false}
                    />
            }
        </View>
    }
}

@observer
class BarListPage extends Page {
    renderView = () => {
        return  <SimpleListView
                    descriptor={discoverViewDescriptor}
                    initialListSize={2}
                    pageSize={1}
                    />
    }
}
