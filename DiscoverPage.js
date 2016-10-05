import {
    React,
    Component,
    View,
    ScrollView,
    ListView,
    PureComponent,
    StyleSheet,
} from './Component.js'
import { computed, observable, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page, Loader } from './Page.js'
import { LargeButton } from './Button.js'
import { BackButton } from './BackButton.js'
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
    renderFooter = () => {
        return <MoreButton />
    }

    handleBack = () => {
        store.setMapVisible(true)
    }

    renderRow = (i) => {
        const bar = mapStore.nearbyBarList[i]
        return <DiscoverBarCard
                    key={bar.id}
                    bar={bar}
                    /*
                    onBack={this.handleBack}
                    showBackButton={i === 0}
                    */
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
        return <View style={{flex: 1}}>
            { /*<MapNearbyToggle />*/}
            {store.mapVisible && <MapPage />}
            {!store.mapVisible && <BarListPage />}
        </View>
    }
}

@observer
class MapNearbyToggle extends PureComponent {

    render = () => {
        return <Header style={{flexDirection: 'row' /*, backgroundColor: '#000' */}}
                       primary={this.props.primary}>
            { !store.mapVisible && <MapButton />}
            { store.mapVisible && <NearbyButton />}
        </Header>
    }
}

@observer
class MapButton extends PureComponent {

    showMap = () => store.setMapVisible(true)

    render = () => {
        return <SelectableButton
                    label='Map'
                    onPress={this.showMap}
                    active={store.mapVisible}
                    disabled={store.mapVisible} /* disable active buttons */
                    style={{flex: 1}} />
    }
}

@observer
class NearbyButton extends PureComponent {

    styles = StyleSheet.create({
        buttonStyle: {
            position: 'absolute',
            top: 0,
            left: 0,
            height: 40,
            margin: 5,
            maxWidth: 300,
        },
    })

    @computed get nearbyLabel() {
        const currentMarker = mapStore.getCurrentMarker()
        if (!currentMarker)
            return 'Bars near Me'
        return `Bars near ${currentMarker.name}`
    }

    @action showNearby = () => {
        store.setMapVisible(false)
    }

    render = () => {
        return <LargeButton
                    label={this.nearbyLabel}
                    style={this.styles.buttonStyle}
                    fontSize={16}
                    onPress={this.showNearby} />
    }

    render2 = () => {
        return  <SelectableButton
                    label={this.nearbyLabel}
                    onPress={this.showNearby}
                    active={!store.mapVisible}
                    disabled={!store.mapVisible} /* disable active buttons */
                    style={{flex: 1}} />
    }
}

@observer
// class MapPage extends Page {
class MapPage extends PureComponent {
    styles = StyleSheet.create({
        view: {
            flex: 1,
        },
        barCard: {
            left: 0,
            bottom: 0,
            position: 'absolute',
            height: 160,
            width: 200,
        },
    })

    // renderView = () => {
    render = () => {
        const bar = mapStore.getCurrentMarker()
        return <View style={this.styles.view}>
            <MapView key='mapView' />
            <NearbyButton />
            { bar &&
                <View style={this.styles.barCard}>
                    <DiscoverBarCard
                        key={bar.id}
                        bar={bar}
                        imageHeight={150}
                        showMapButton={false}
                        />
                </View>
            }
        </View>
    }
}

@observer
class BarListPage extends Page {

    styles = {
        view: {
            flex: 1,
            paddingBottom: 5,
        },
        outerButtonStyle: {
            position: 'absolute',
            top: 10,
            left: 10,
            width: 60,
            height: 60,
            zIndex: 10,
        },
        innerButtonStyle: {
            // position: 'absolute',
            // top: 0,
            // left: 0,
            // width: 60,
            // height: 60,
            // margin: 5,
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 30,
        },

    }

    @action showMap = () => {
        mapStore.allowBarListReordering(true)
        store.setMapVisible(true)
    }

    renderView = () => {
        return  <View style={this.styles.view}>
            {/*
            <LargeButton
                label="Map"
                style={this.styles.buttonStyle}
                fontSize={16}
                onPress={this.showMap} />
            */}
            {
            <BackButton
                onBack={this.showMap}
                enabled={true}
                style={this.styles.outerButtonStyle}
                buttonStyle={this.styles.innerButtonStyle}
                /* color='#000' */
                iconSize={35}
                />
            }
            <SimpleListView
                descriptor={discoverViewDescriptor}
                initialListSize={2}
                pageSize={1}
                />
        </View>
    }
}

@observer
class MoreButton extends PureComponent {
    /* properties:
        style: style object
        canReorderBarList: Bool
    */

    static defaultProps = {
        canReorderBarList: false,
    }

    styles = {
        button: {
            height: 55,
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
        },
    }

    @action loadMoreData = () => {
        mapStore.allowBarListReordering(this.props.canReorderBarList)
        mapStore.loadMoreData()
    }

    render = () => {
        if (!mapStore.canLoadMoreData)
            return <View />

        log("MORE BUTTON IS LOADING......................", mapStore.moreButtonLoading)

        return <View>
            {
                mapStore.moreButtonLoading &&
                    <Loader style={{margin: 5}} />
            }
            <LargeButton
                label="More"
                style={{...this.styles.button, ...this.props.style}}
                onPress={this.loadMoreData}
                disabled={!mapStore.moreButtonEnabled} />
        </View>
    }
}
