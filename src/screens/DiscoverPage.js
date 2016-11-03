import {
    React,
    View,
    PureComponent,
    StyleSheet
} from '/components/Component'
import { computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page, Loader } from '/components/Page'
import { LargeButton } from '/components/Button'
import { BackButton } from '/components/BackButton'
import { MapView } from '/components/MapView'
import { DiscoverBarCard } from '/components/bar/DiscoverBarCard'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { Header, TextHeader } from '/components/Header'
import { SelectableButton } from '/components/ButtonRow'
import { Descriptor, SimpleListView } from '/components/SimpleListView'
import { store, mapStore, historyStore, segment, searchStore } from '/model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/screens/DiscoverPage')

assert(Page)
assert(Loader)
assert(LargeButton)
assert(BackButton)
assert(MapView)
assert(DiscoverBarCard)
assert(DownloadResultView)
assert(Header)
assert(TextHeader)
assert(SelectableButton)
assert(Descriptor)
assert(SimpleListView)

@observer
export class DiscoverPage extends DownloadResultView {
    errorMessage      = "Error downloading list of bars"
    refreshPage       = () => mapStore.updateNearbyBars(force = true)
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()
    renderNotStarted  = () => null
    renderFinished    = (searchResponse) => <DiscoverView />
}

class DiscoverViewDescriptor extends Descriptor {
    get numberOfRows() {
        return mapStore.nearbyBarList.length
    }

    // renderHeader = () => <MapView key='mapview' />
    renderFooter = () => {
        return <MoreButton canReorderBarList={false} />
    }

    handleBack = () => {
        store.setMapVisible(true)
    }

    refresh = async () => {
        await this.runRefresh(() => mapStore.updateNearbyBars(force = true))
    }

    renderRow = (i) => {
      // SORT HERE
        const bar = mapStore.nearbyBarList[i]
        if (bar.name.includes(searchStore.getState().barSearch)) {
            return (<DiscoverBarCard
                key={bar.id}
                bar={bar}
                        /*
                        onBack={this.handleBack}
                        showBackButton={i === 0}
                        */
                        imageHeight={190} />)
        } else {
            return null
        }
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

    renderView = () => {
        return <View style={{flex: 1}}>
            { /*<MapNearbyToggle />*/}
            {store.mapVisible && <MapPage />}
            {!store.mapVisible && <BarListPage />}
        </View>
    }
}

@observer
class NearbyButton extends PureComponent {

    styles = StyleSheet.create({
        buttonContainerStyle: {
            position: 'absolute',
            flexWrap: 'wrap',
            top: 0,
            left: 0,
            height: 40,
            margin: 10,
            maxWidth: 200,
        },
        buttonStyle: {
            height: 40,
        },
    })

    @computed get nearbyLabel() {
        const currentMarker = mapStore.getCurrentMarker()
        if (!currentMarker)
            return 'Bars near Me'
        let label = `Bars near ${currentMarker.name}`
        const N = 20
        if (label.length > N) {
            label = label.slice(0, N) + '...'
        }
        return label
    }

    @action showNearby = () => {
        store.setMapVisible(false)
        mapStore.allowBarListReordering(true)
        historyStore.push('nearby')
        const currentMarker = mapStore.getCurrentMarker()
        const properties = currentMarker &&
            {nearMe: false, placeID: currentMarker.id, placeName: currentMarker.name} ||
            {'nearMe': true}
        segment.track('Bar List', properties)
    }

    render = () => {
        return <View style={this.styles.buttonContainerStyle}>
            <LargeButton
                label={this.nearbyLabel}
                style={this.styles.buttonStyle}
                fontSize={16}
                onPress={this.showNearby} />
        </View>
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
    styles = {
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
        moreButtonContainer: {
            top: 0,
            right: 65,
            position: 'absolute',
            height: 40,
            width:  80,
            margin: 5,
        },
        moreButton: {
            height: 40,
            width:  60,
            marginLeft: 20,
        },
    }

    // renderView = () => {
    render = () => {
        const bar = mapStore.getCurrentMarker()
        return <View style={this.styles.view}>
            <MapView key='mapView' />
            <NearbyButton />
            <View style={this.styles.moreButtonContainer}>
                <MoreButton
                    style={this.styles.moreButton}
                    fontSize={16}
                    canReorderBarList={true}
                    horizontal={true}
                    />
            </View>
            { bar &&
                <View style={this.styles.barCard}>
                    <DiscoverBarCard
                        key={bar.id}
                        bar={bar}
                        imageHeight={150}
                        showMapButton={false}
                        showBorder={true}
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
            top: 50,
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
        historyStore.pop()
        showMap()
    }

    loadMore = async () => {
        log("LOADING MORE DATA.............")
        await loadMoreData(false)
    }

    renderView = () => {
        const infiniteScrollProps = {
            ...this.props,
            canLoadMore:     mapStore.canLoadMoreData,
            onLoadMoreAsync: this.loadMore, // () => this.loadMoreData(false),
        }
        return  <View style={this.styles.view}>
                <BackButton
                    onBack={this.showMap}
                    enabled={true}
                    style={this.styles.outerButtonStyle}
                    buttonStyle={this.styles.innerButtonStyle}
                    /* color='#000' */
                    iconSize={35}
                    />
                <SimpleListView
                    descriptor={discoverViewDescriptor}
                    initialListSize={2}
                    pageSize={1}
                    /* renderScrollComponent={props => <InfiniteScrollView {...infiniteScrollProps} />} */
                    />
        </View>
    }
}

const showMap = () => {
    store.setMapVisible(true)
}


const loadMoreData = async (canReorderBarList : Bool) => {
    mapStore.allowBarListReordering(canReorderBarList)
    await mapStore.loadMoreData()
}

@observer
class MoreButton extends PureComponent {
    /* properties:
        style: style object
        canReorderBarList: Bool
        fontSize: Int
        horizontal:
            whether to render the loader above or next to the button
    */

    static defaultProps = {
        canReorderBarList: false,
        horizontal: false,
    }

    styles = {
        horizontal: {
            flexDirection: 'row',
        },
        button: {
            height: 55,
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
        },
    }

    render = () => {
        return <View style={this.props.horizontal && this.styles.horizontal}>
            {
                mapStore.moreButtonLoading &&
                    <Loader />
            }
            { mapStore.canLoadMoreData &&
                <LargeButton
                    label="More"
                    style={{...this.styles.button, ...this.props.style}}
                    fontSize={this.props.fontSize}
                    onPress={() => loadMoreData(this.props.canReorderBarList)}
                    disabled={!mapStore.moreButtonEnabled} />
            }
        </View>
    }
}

historyStore.registerHandler('nearby', (_) => showMap())
