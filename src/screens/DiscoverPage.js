import {
    React,
    View,
    PureComponent,
    StyleSheet
} from '/components/Component'
import { observable, computed, action } from 'mobx'
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

@observer
export class DiscoverPage extends DownloadResultView {
    @observable barListVisible = false

    errorMessage      = "Error downloading list of bars"
    refreshPage       = () => mapStore.updateNearbyBars(force = true)
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()

    renderFinished = (searchResponse) => {
        return <View style={{flex: 1}}>
            <SimpleListView
                ref={ref => store.discoverScrollView = ref}
                descriptor={discoverViewDescriptor}
                initialListSize={2}
                pageSize={1}
                />
        </View>
    }
}

const mapHeight = 280

class DiscoverViewDescriptor extends Descriptor {

    progressViewOffset = mapHeight

    @computed get rows() {
        return mapStore.nearbyBarList
    }

    rowHasChanged = (bar1, bar2) => bar1.id !== bar2.id

    renderHeader = () => {
        return <View style={{flex: 1, height: mapHeight}}>
            <MapView key='mapview' />
        </View>
    }

    renderFooter = () => {
        return <MoreButton canReorderBarList={false} />
    }

    handleBack = () => {
        store.setMapVisible(true)
    }

    /* NOTE: This breaks the map movements :( */
    // refresh = async () => {
    //     await this.runRefresh(() => mapStore.updateNearbyBars(force = true))
    // }

    renderRow = (bar, sectionID, rowID) => {
        log("RENDERING BAR CARD", rowID)
        return (
            <DiscoverBarCard
                key={bar.id}
                bar={bar}
                /*
                onBack={this.handleBack}
                showBackButton={i === 0}
                */
                imageHeight={190}
                />
        )
    }
}

const discoverViewDescriptor = new DiscoverViewDescriptor()

@observer
export class DiscoverView extends Page {
    renderView = () => {
        return <View style={{flex: 1}}>
            { /*<MapNearbyToggle />*/}
            <BarList />
            {/*store.mapVisible && <MapPage />*/}
            {/*!store.mapVisible && <BarListPage />*/}
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
                fonrSize={16}
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
    /* properties:
        showBackButton: Bool
    */

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
            { this.props.showBackButton &&
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
