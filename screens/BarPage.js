import {
    React,
    Component,
    Image,
    View,
    ScrollView,
    TouchableOpacity,
    PureComponent,
    T,
    Icon,
    MaterialIcon,
    StyleSheet,
} from '~/components/Component'
import Dimensions from 'Dimensions'
import Swiper from 'react-native-swiper'
import { observable, action, computed, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'
import ParallaxScrollView from 'react-native-parallax-scroll-view'
import { phonecall, email, web } from 'react-native-communications'

import { BarMenu } from '~/components/bar/BarMenu.js'
import { BarCardFooter } from '~/components/bar/BarCardFooter'
import { LazyBarPhoto } from '~/components/bar/LazyBarPhoto'
import { OpeningTimeView } from '~/components/OpeningTimeView'
import { themedRefreshControl } from '~/components/SimpleListView'
import { DownloadResultView } from '~/components/download/DownloadResultView'
import { TextHeader } from '~/components/Header'
import { TextSelectorRow } from '~/components/Selector'
import { SimpleModal } from '~/components/Modals'
import { LazyComponent } from '~/components/LazyComponent'
import { PhotoImage } from '~/components/PhotoImage'
import { Page } from '~/components/Page'
import { ImageSwiper } from '~/components/ImageSwiper'
import { LargeButton } from '~/components/Button'
import { FavBarContainer } from '~/components/Fav'
import { tabStore, barStore, timeStore, mapStore, segment } from '~/model/store'
import { config } from '~/utils/config'
import * as _ from '~/utils/curry'

const { assert, log } = _.utils('~/components/bar/BarPage.js')

@observer
export class BarInfoFetcher extends DownloadResultView {
    errorMessage = 'Error downloading bar info'

    refreshPage = () => {
        barStore.updateBarInfo(barStore.barID, force = true)
    }

    getDownloadResult = () => barStore.getBarDownloadResult()
}

const headerHeight = 250
const stickyHeaderHeight = 55

@observer
export class BarPage extends Page {
    /* properties:
        width: int
        height: int
    */

    styles = StyleSheet.create({
        bottomBorder: {
            borderBottomWidth: 0.5,
            minHeight: 300,
            borderColor: 'rgba(0, 0, 0, 0.2)',
        }
    })

    renderBarHeader = (height : Int) => {
        return <BarHeader imageHeight={height} />
    }

    renderStickyHeader = () => {
        return <BarStickyHeader />
    }

    renderView = () => {
        return <ParallaxScrollView
                    ref={ref => barStore.barScrollView = ref}
                    backgroundSpeed={60}
                    contentBackgroundColor='#fff'
                    parallaxHeaderHeight={headerHeight}
                    renderForeground={() => this.renderBarHeader(headerHeight)}
                    renderStickyHeader={this.renderStickyHeader}
                    stickyHeaderHeight={stickyHeaderHeight}
                    /* refreshControl={this.getRefreshControl()} */
                    >
            <BarIcons />
            <View style={this.styles.menuView}>
                <MenuView />
            </View>
            <BarFooter />
        </ParallaxScrollView>
    }
}

@observer
class BarHeader extends BarInfoFetcher {
    /* properties:
        imageHeight: Int
    */

    renderNotStarted = () => <View style={{height: this.props.imageHeight}} />
    renderError = () => <View />
    renderInProgress = () => <View />
    renderFinished = () => {
        return <LazyBarImages
                    bar={barStore.getBar()}
                    imageHeight={this.props.imageHeight}
                    showBackButton={false} />
    }
}

@observer
class BarStickyHeader extends BarInfoFetcher {
    styles = StyleSheet.create({
        stickyHeader: {
            backgroundColor: '#000',
            height: stickyHeaderHeight,
            paddingTop: 5,
            paddingBottom: 5,
        },
    })

    renderError = () => <View />
    renderInProgress = () => <View />
    renderFinished = () => {
        return <View style={this.styles.stickyHeader}>
            <BarCardFooter
                bar={barStore.getBar()}
                showDistance={false}
                showTimeInfo={true}
                showBarName={true}
                showMapButton={true}
                />
        </View>
    }
}

const handleFocusBarOnMap = (bar) => {
    mapStore.focusBar(bar, switchToDiscoverPage = true, track = true)
}


@observer
class BarIcons extends BarInfoFetcher {
    @observable refreshing = false
    openingTimesModal = null

    styles = StyleSheet.create({
        view: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 20,
            paddingRight: 20,
            borderBottomWidth: 0.5,
            borderColor: 'rgba(0, 0, 0, 0.2)',
            minHeight: 60,
        },
        iconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
            height: 60,
        },
    })

    handleShowOpeningTimes = () => {
        this.openingTimesModal.show()
        segment.track('Show Opening Times', {
            placeID:    barStore.barID,
            placeName:  barStore.barName,
        })
    }

    handleRefresh = () => {
        this.refreshing = true
        transaction(async () => {
            await barStore.updateBarAndMenu(barStore.barID, force = true)
            this.refreshing = false
        })
    }

    getRefreshControl = () => {
        return themedRefreshControl({
            refreshing: this.refreshing,
            onRefresh:  this.handleRefresh,
        })
    }

    renderError = () => <View />
    renderInProgress = () => <View />
    renderFinished = (bar) => {
        return <View style={this.styles.view}>
            <OpeningTimesModal
                ref={ref => this.openingTimesModal = ref}
                />
            <TouchableOpacity
                style={this.styles.iconStyle}
                onPress={this.handleShowOpeningTimes}
                >
                {/*<Icon name="clock-o" size={40} color="rgb(1, 68, 139)" />*/}
                <Icon
                    name="clock-o"
                    size={40}
                    color={config.theme.secondary.medium}
                    />
                <T style={{color: '#000000'}}>TIMES</T>
            </TouchableOpacity>
            <FavBarContainer barID={bar.id} iconSize={40} style={this.styles.iconStyle}>
                <T style={{color: '#000000'}}>SAVE</T>
            </FavBarContainer>
            <TouchableOpacity
                    style={this.styles.iconStyle}
                    onPress={() => handleFocusBarOnMap(bar)}
                    >
                <Icon name="map-marker" size={40} color="rgb(181, 42, 11)" />
                <T style={{color: '#000000'}}>MAP</T>
            </TouchableOpacity>
        </View>
    }
}

@observer
class MenuView extends DownloadResultView {
    getDownloadResult = () => barStore.getMenuDownloadResult()
    renderFinished = (menu) => <BarMenu menu={menu} />
}

@observer
class BarFooter extends BarInfoFetcher {
    styles = StyleSheet.create({
        infoView: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 10,
            margin: 10,
        }
    })
    renderError = () => null
    renderInProgress = () => null
    renderFinished = (bar) => {
        return <View>
            <View style={this.styles.infoView}>
                <InfoItem
                    iconName="map-marker"
                    info={formatAddress(bar.address)}
                    onClick={() => handleFocusBarOnMap(bar)}
                    />
                {bar.phone ?
                    <InfoItem
                        iconName="phone"
                        info={bar.phone}
                        onClick={() => phonecall(bar.phone, false)}
                        />
                    : undefined
                }
                {bar.website ?
                    <InfoItem
                        /* iconName="chrome" */
                        /* iconName="external-link" */
                        iconName="firefox"
                        info={bar.website}
                        onClick={() => web(bar.website)}
                        />
                    : undefined
                }
            </View>
            <View style={{alignItems: 'center'}}>
                <Image
                    source={require('~/logos/powered_by_google_on_white.png')}
                    />
                {/* TODO: display additional attribution stuff here */}
            </View>
        </View>
    }
}

const dayNames = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
]

@observer
class OpeningTimesModal extends PureComponent {
    /* properties:
        openingTimes: Array<OpeningTime>
    */

    modal = null
    show = () => this.modal.show()
    close = () => this.modal.close()

    styles = {
        view: {
            flex: 1,
        },
        openingTimeView: {
            height:             55,
            flexDirection:      'row',
            // justifyContent: 'flex-start',
            alignItems:         'center',
            borderBottomWidth:  1,
            borderColor:        config.theme.primary.medium,
        },
        day: {
            flex: 1,
            justifyContent: 'center',
            paddingLeft: 5,
        },
        dayTextStyle: {
            fontSize: 25,
            fontWeight: 'bold',
            color: '#000',
            fontFamily: undefined, // TODO: Install bold font
            // textDecorationLine: 'underline',
        },
        openingTime: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        openingTimeTextStyle: {
            fontSize: 25,
            color: '#000',
            fontFamily: undefined, // TODO: Install bold font
        },
    }

    @computed get openingTimes() {
        const bar = barStore.getBar()
        return bar && bar.openingTimes || []
    }

    @computed get haveOpeningTimes() {
        return this.openingTimes.length > 0
    }

    render = () => {
        return <SimpleModal ref={ref => this.modal = ref}>
            <View style={this.styles.view}>
                <TextHeader
                    label="Opening Times"
                    rowHeight={55}
                    />
                {
                    this.openingTimes.map(this.renderOpeningTime)
                }
            </View>
        </SimpleModal>
    }

    renderOpeningTime = (openingTime, i) => {
        const today = i === timeStore.today
        const openingTimeView = {
            ...this.styles.openingTimeView,
            backgroundColor: today ? config.theme.todayBackgroundColor : '#fff'
        }
        const openingTimeTextStyle = {
            ...this.styles.openingTimeTextStyle,
            fontWeight: today ? 'bold' : 'normal'
        }
        return <View key={i} style={openingTimeView}>
            <View style={this.styles.day}>
                <T style={this.styles.dayTextStyle}>
                    {dayNames[i]}
                </T>
            </View>
            <View style={this.styles.openingTime}>
                <OpeningTimeView
                    openingTime={openingTime}
                    textStyle={openingTimeTextStyle}
                    />
            </View>
        </View>
    }
}

@observer
export class LazyBarImages extends PureComponent {
    render = () => {
        return <LazyComponent style={{height: this.props.imageHeight}}>
            <BarImages {...this.props} />
        </LazyComponent>
    }
}

@observer
export class BarImages extends PureComponent {
    /* properties:
        bar: Bar
        imageHeight: Int
        showBackButton: Bool
        onBack: () => void
    */

    @observable autoplay = true
    timeout = 3.0 // switch to next image after 3 seconds

    constructor(props) {
        super(props)
        this.timer = undefined
        _.safeAutorun(() => {
            /* Whenever barStore.bar changes, reinitialize autoplay to `true`
               and cancel any timers that are going to set it to `false`
            */
            barStore.getBarDownloadResult()
            this.autoplay = true
            if (this.timer) {
                clearTimeout(this.timer)
                this.timer = undefined
            }
        })
    }

    componentDidMount = () => {
        if (this.autoplay) {
            this.timer = setTimeout(
                () => { this.autoplay = false },
                (this.timeout * this.props.bar.photos.length) * 1000,
            )
        }
    }

    render = () => {
        const bar = this.props.bar

        const imageHeight = this.props.imageHeight

        return (
            <ImageSwiper
                height={imageHeight}
                autoplay={this.autoplay}
                autoplayTimeout={this.timeout}
                showButtons={true}
                >
                {
                    bar.photos.map((photo, i) =>
                        <LazyBarPhoto
                            key={photo.url}
                            bar={bar}
                            photo={photo}
                            timeout={i * 500 - 500}
                            imageHeight={imageHeight}
                            showMapButton={false}
                            {...this.props}
                            />
                    )
                }
            </ImageSwiper>
        )
    }
}

const formatAddress = (address) => {
    return address.formattedAddress
    // return `${address.number} ${address.street}, ${address.city}, ${address.postcode}`
}

@observer
class InfoItem extends PureComponent {
    /* properties:
        iconName: str
        info: str
        onClick: callback when the info item is clicked (or undefined)
    */

    styles = StyleSheet.create({
        view: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            minHeight: 50,
        },
        iconView: {
            width: 70,
            alignItems: 'center',
        },
    })
    render = () => {
        let info = (
            <View style={this.styles.view}>
                <View style={this.styles.iconView}>
                    <Icon
                        name={this.props.iconName}
                        size={30}
                        color={config.theme.primary.medium}
                        />
                </View>
                <T style={{fontSize: 15, color: '#fff'}}>
                    {this.props.info}
                </T>
            </View>
        )

        if (this.props.onClick) {
            info = <TouchableOpacity onPress={this.props.onClick}>
                {info}
            </TouchableOpacity>
        }
        return info
    }
}
