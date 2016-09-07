import {
    React, Component, Image, View, ScrollView, TouchableOpacity,
    PureComponent, T, Icon, MaterialIcon,
} from '../Component.js'
import Dimensions from 'Dimensions'
import Swiper from 'react-native-swiper'
import { observable, action } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { BarMenu } from './BarMenu.js'
import { BarCardFooter } from './BarCard.js'

import { LazyComponent } from '../LazyComponent.js'
import { DownloadResultView } from '../HTTP.js'
import { PhotoImage } from '../Maps/Photos.js'
import { Page } from '../Page.js'
import { ImageSwiper } from '../ImageSwiper.js'
import { LargeButton } from '../Button.js'
import { FavBarContainer } from '../Fav.js'
import { mapStore } from '../Maps/MapStore.js'
import { tabStore, barStore } from '../Store.js'
import { config } from '../Config.js'
import { merge, safeAutorun, log } from '../Curry.js'

@observer
export class BarPageFetcher extends DownloadResultView {
    constructor(props) {
        super(props, "Error downloading bar page")
    }

    refreshPage = () => {
        barStore.refreshBar()
    }

    getDownloadResult = () => {
        // barStore.bar.value
        // barStore.menuDownloadResult.value
        return barStore.getBarAndMenuDownloadResult()
    }

    renderNotStarted = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Please select a bar first"
                onPress={() => {tabStore.setCurrentTab(0)}}
                />
        </View>
}

@observer
export class BarPage extends BarPageFetcher {
    /* properties:
        width: int
        height: int
    */

    @observable autoplay = true

    constructor(props) {
        super(props)
        this.timer = undefined
        safeAutorun(() => {
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

    renderFinished = ([bar, menu]) => <BarView bar={bar} menu={menu} />
}

class BarView extends Page {
    /* properties:
        bar:  Bar
        menu: Menu
    */

    @action handleFocusBarOnMap = () => {
        mapStore.focusBar(this.props.bar)
    }

    renderView = () => {
        const bar = this.props.bar
        const menu = this.props.menu

        return (
            <ScrollView>
                <LazyBarHeader
                    bar={this.props.bar}
                    imageHeight={300}
                    showBackButton={false}
                    />
                {/*
                <LinearGradient
                        style={
                            { flexDirection:    'row'
                            , justifyContent:   'flex-end'
                            }}
                        colors={
                            [ 'rgba(0, 0, 0, 0.95)'
                            , 'rgba(0, 0, 0, 0.8)'
                            , 'rgba(0, 0, 0, 0.95)'
                            ]}
                        >
                    <BarCardFooter bar={bar} showMapButton={false} />
                </LinearGradient>
                */}
                <View style={
                        merge(styles.bottomBorder,
                            { flex: 1
                            , flexDirection: 'row'
                            , paddingTop: 5
                            , paddingBottom: 5
                            }
                        )
                    }>
                    <TouchableOpacity
                            style={{flex: 1}}
                            onPress={this.handleShowOpeningTimes}
                            >
                        <View style={{flex: 1, alignItems: 'center'}}>
                            {/*<Icon name="clock-o" size={40} color="rgb(1, 68, 139)" />*/}
                            <Icon
                                name="clock-o"
                                size={40}
                                color={config.theme.secondary.medium}
                                />
                            <T style={{color: '#000000'}}>TIMES</T>
                        </View>
                    </TouchableOpacity>
                    <FavBarContainer barID={bar.id} iconSize={40} style={{flex: 1, alignItems: 'center'}}>
                        <T style={{color: '#000000'}}>SAVE</T>
                    </FavBarContainer>
                    <TouchableOpacity
                            style={{flex: 1}}
                            onPress={this.handleFocusBarOnMap}
                            >
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <Icon name="map-marker" size={40} color="rgb(181, 42, 11)" />
                            <T style={{color: '#000000'}}>MAP</T>
                        </View>
                    </TouchableOpacity>
                </View>
                {/*
                <T style={
                        { marginLeft: 10
                        , fontSize: 20
                        , color: config.theme.primary.medium
                        }}>
                    Menu
                </T>
                */}
                <View style={styles.bottomBorder}>
                    <BarMenu bar={bar} menu={menu} />
                </View>
                <InfoItem
                    iconName="map-marker"
                    info={formatAddress(bar.address)}
                    onClick={this.handleFocusBarOnMap}
                    />
                {bar.phone ?
                    <InfoItem
                        iconName="phone"
                        info={bar.phone}
                        onClick={() => undefined}
                        />
                    : undefined
                }
                {bar.website ?
                    <InfoItem
                        /* iconName="chrome" */
                        /* iconName="external-link" */
                        iconName="firefox"
                        info={bar.website}
                        onClick={() => undefined}
                        />
                    : undefined
                }
                <View style={{alignItems: 'center'}}>
                    <Image
                        source={require('../logos/powered_by_google_on_white.png')}
                        style={{marginTop: 10}}
                        />
                    {/* TODO: display additional attribution stuff here */}
                </View>
            </ScrollView>
        )
    }
}

@observer
export class LazyBarHeader extends PureComponent {
    render = () => {
        return <LazyComponent
                    timeout={0}
                    style={{height: this.props.imageHeight}}
                    >
            <BarHeader {...this.props} />
        </LazyComponent>
    }
}

@observer
export class BarHeader extends PureComponent {
    /* properties:
        imageHeight: Int
        showBackButton: Bool
        onBack: () => void
    */
    render = () => {
        const bar = this.props.bar

        const imageHeight = this.props.imageHeight
        const timeout = 3.0 // switch to next image after 3 seconds
        if (this.autoplay) {
            this.timer = setTimeout(
                () => { this.autoplay = false },
                (timeout * bar.images.length) * 1000,
            )
        }

        return (
            <ImageSwiper
                height={imageHeight}
                autoplay={this.autoplay}
                autoplayTimeout={timeout}
                >
                {bar.photos.map((photo, i) =>
                    <PhotoImage
                        key={photo.url}
                        photo={photo}
                        style={{flex: 1, height: imageHeight}}
                        >
                        {
                            this.props.showBackButton
                                ? <TouchableOpacity onPress={this.props.onBack}>
                                    <View style={
                                            { width: 55
                                            , height: 55
                                            , justifyContent: 'center'
                                            , alignItems: 'center'
                                            }
                                        }>
                                        <MaterialIcon name="arrow-back" size={30} color='#fff' />
                                  </View>
                                  </TouchableOpacity>
                                : <View style={{flex: 1}} />
                        }
                        <LinearGradient style={{flex: 1}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                                <BarCardFooter bar={bar} showMapButton={false} />
                            </View>
                        </LinearGradient>
                    </PhotoImage>
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
    render = () => {
        var info = (
            <View style={
                    { flexDirection: 'row'
                    , justifyContent: 'flex-start'
                    , alignItems: 'center'
                    , minHeight: 50
                    }
                }>
                <View style={{width: 70, alignItems: 'center'}}>
                    <Icon
                        name={this.props.iconName}
                        size={30}
                        color={config.theme.secondary.medium}
                        />
                </View>
                <T style={{fontSize: 15, color: 'rgba(0, 0, 0, 0.6)'}}>
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

const styles = {
    bottomBorder: {
        borderBottomWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.2)',
    }
}
