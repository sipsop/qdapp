import {
    React,
    Component,
    View,
    ScrollView,
    ListView,
    TouchableOpacity,
    Platform,
    T,
    PureComponent,
    StyleSheet,
    Dimensions,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import NativeMapView from 'react-native-maps'

import { DownloadResultView } from './download/DownloadResultView'
import { LargeButton } from '/components/Button'
import { store, tabStore, barStore } from '/model/store'
import { mapStore, getBarCoords } from '/model/mapstore'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const pubColor  = config.theme.primary.medium
const clubColor = config.theme.primary.medium // config.theme.secondary.light
const passiveColor = 'rgb(222, 151, 14)'

const { log, assert } = _.utils('Maps/MapView.js')

const { width } = Dimensions.get('window')

const mapStyles = {
    mapStyle: {
        flex: 1,
        // height: 450,
        // position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    searchButtonView: {
        flex: 0,
        alignItems: 'center',
        position: 'absolute',
        width: 150,
        top: 12,
        left: width / 2 - 75,
    },
    searchButton: {
        height: 38,
        width:  150,
    },
}

@observer
export class MapView extends DownloadResultView {
    errorMessage = "Error downloading map"

    @action handleRegionChange = (region) => {
        mapStore.userChangedRegion(region)
    }

    @action handleMapPress = (value) => {
        mapStore.setCurrentMarker(null, track = true)
    }

    getDownloadResult = mapStore.getNearbyBarsDownloadResult
    refreshPage = mapStore.searchNearby

    renderFinished = (searchResponse) => {
        return (
            <View style={{flex: 1, /* height: 275*/}}>
                <NativeMapView
                    ref={mapView => {mapStore.mapView = mapView}}
                    style={mapStyles.mapStyle}
                    /* NOTE: You need to add NSLocationWhenInUseUsageDescription key in Info.plist to enable geolocation, otherwise it is going to fail silently! */
                    showsUserLocation={true}
                    region={mapStore.region}
                    onRegionChange={this.handleRegionChange}
                    loadingEnabled={true}
                    loadingIndicatorColor={config.theme.primary.medium}
                    onPress={this.handleMapPress}
                    >
                    {
                        mapStore.allMarkers.map(bar =>
                            <MapMarker key={bar.id} bar={bar} />
                        )
                    }
                </NativeMapView>
                <View style={mapStyles.searchButtonView}>
                    <LargeButton
                        label="Search Here"
                        prominent={false}
                        fontSize={20}
                        style={mapStyles.searchButton}
                        textColor={config.theme.primary.medium}
                        borderWidth={0.5}
                        borderColor={config.theme.primary.dark}
                        onPress={mapStore.searchNearby} />
                </View>
            </View>
        )
    }
}

const coords = (bar) => {
    return {
        latitude: bar.address.lat,
        longitude: bar.address.lon,
    }
}

@observer
class MapMarker extends PureComponent {
    /* properties:
        bar: Bar
    */

    @observable markerRef = null

    constructor(props) {
        super(props)
        /* Set a timeout for the marker update, as 'markerRef.showCallout()'
           doesn't work when done immediately on load */
        setTimeout(this.autoUpdateCallout, 2000)
    }

    autoUpdateCallout = () => {
        autorun(() => {
            if (this.selected && this.markerRef) {
                this.markerRef.showCallout()
            } else if (this.markerRef) {
                this.markerRef.hideCallout()
            }
        })
    }

    @action handleMarkerPress = () => {
        store.switchToDiscoverPage(scrollToTop = true)
        mapStore.setCurrentMarker(this.props.bar, track = true)
    }

    @action handleCalloutPress = () => {
        barStore.setBarID(this.props.bar.id, true)
        tabStore.setCurrentTab(1)
    }

    @computed get selected() {
        const currentMarker = mapStore.getCurrentMarker()
        if (!currentMarker)
            return false
        return this.props.bar.id === currentMarker.id
    }

    @computed get isSignedUp() {
        // TODO: implement
        return true
    }

    render = () => {
        const bar = this.props.bar
        const signedUp = this.isSignedUp
        const title =
            signedUp
                ? bar.name
                : bar.name + ' (menu unavailable)'

        const description =
            signedUp
                ? bar.desc
                : bar.desc

        const color =
            signedUp
                ? pubColor
                : passiveColor

        const androidProps = {
            title: title,
            description: description,
            onCalloutPress: this.handleCalloutPress,
        }

        const iosProps = {

        }

        const props = androidProps // Platform.OS === 'android' ? androidProps : iosProps

        return <NativeMapView.Marker
                    ref={markerRef => {this.markerRef = markerRef}}
                    coordinate={getBarCoords(bar)}
                    pinColor={pubColor}
                    onPress={this.handleMarkerPress}
                    onSelect={this.handleMarkerPress}
                    {...props}
                    >
            {
                Platform.OS === 'ios' && false // TODO: remove 'false'
                    ? <NativeMapView.Callout tooltip={true}>
                        <MarkerCallout
                            title={title}
                            description={description}
                            onPress={this.handleMarkerPress}
                            />
                      </NativeMapView.Callout>
                    : undefined
            }
        </NativeMapView.Marker>
    }
}

@observer
class MarkerCallout extends PureComponent {
    /* properties:
        title: String
        description: String
        onPress() => void
    */
    render = () => {
        const textStyle = {
            color: '#000',
        }
        const height = 30
        return <CustomCallout style={{width: 140, height: height, backgroundColor: '#fff'}}>
            <TouchableOpacity style={{flex: 1}} onPress={this.props.onPress}>
                <View style={{flex: 1, height: height}}>
                    <T fontSize={16} style={{...textStyle, fontWeight: 'bold'}}>
                        {this.props.title}
                    </T>
                    <T fontSize={14} style={textStyle}>
                        {this.props.description}
                    </T>
                </View>
            </TouchableOpacity>
        </CustomCallout>
    }
}

@observer
class CustomCallout extends PureComponent {
    render = () => {
        return (
            <View style={[styles.container, this.props.style]}>
                <View style={styles.bubble}>
                    <View style={styles.amount}>
                    {this.props.children}
                    </View>
                </View>
                <View style={styles.arrowBorder} />
                <View style={styles.arrow} />
            </View>
        )
    }
}


const styles = {
    container: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
    },
    bubble: {
        width: 140,
        minHeight: 80,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#4da2ab',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 6,
        borderColor: '#007a87',
        borderWidth: 0.5,
    },
    amount: {
        flex: 1,
    },
    arrow: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#4da2ab',
        alignSelf: 'center',
        marginTop: -32,
    },
        arrowBorder: {
        backgroundColor: 'transparent',
        borderWidth: 16,
        borderColor: 'transparent',
        borderTopColor: '#007a87',
        alignSelf: 'center',
        marginTop: -0.5,
    },
}
