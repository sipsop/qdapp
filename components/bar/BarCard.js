import {
    React,
    Component,
    View,
    TouchableOpacity,
    MaterialIcon,
    PureComponent,
    Dimensions,
    StyleSheet,
    T,
} from '../Component.js'
import { action, transaction, computed } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { LazyComponent } from '../LazyComponent.js'
import { SmallOkCancelModal } from '../Modals.js'
import { BackButton } from '../BackButton.js'
import { PhotoImage } from '../Maps/Photos.js'
import { store, tabStore, mapStore, orderStore } from '/model/store.js'
import * as _ from '/utils/curry.js'
import { barStore, getBarOpenTime } from '/model/barstore.js'
import { config } from '/utils/config.js'

const { log, assert } = _.utils('./bar/BarCard.js')

@observer
export class DiscoverBarCard extends PureComponent {
    /* properties:
        borderRadius: Int
        imageHeight: Int
        bar: Bar
            bar info
        onBack: ?() => void
        showBackButton: Bool
    */
    modal = null

    static defaultProps = {
        borderRadius: 5,
    }

    styles = StyleSheet.create({
        view: {
            flex: 0,
            height: this.props.imageHeight,
            marginTop: 5,
            marginLeft: 5,
            marginRight: 5,
            borderRadius: this.props.borderRadius,
        },
    })

    handleCardPress = () => {
        if (orderStore.orderList.length > 0 && this.props.bar.id !== barStore.barID)
            this.modal.show()
        else
            this.setBar()
    }

    @action setBar = () => {
        barStore.setBarID(this.props.bar.id, track = true)
        tabStore.setCurrentTab(1)
        if (barStore.barScrollView)
            barStore.barScrollView.scrollTo({x: 0, y: 0})
    }

    render = () => {
        const photos = this.props.bar.photos
        const useGenericPicture = !photos || !photos.length

        // log("RENDERING BAR CARD", this.props.bar.name)

        return <View style={this.styles.view}>
            <ConfirmChangeBarModal
                ref={ref => this.modal = ref}
                onConfirm={this.setBar}
                />
            <BarCard
                {...this.props}
                photo={photos && photos.length && photos[0]}
                onPress={this.handleCardPress}
                showDistance={true}
                />
        </View>
    }
}

@observer
class ConfirmChangeBarModal extends PureComponent {
    /* properties:
        onCOnfirm: () => void
    */
    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    @computed get currentBarName() {
        const currentBar = barStore.getBar()
        return currentBar ? currentBar.name : ""
    }

    render = () => {
        return <SmallOkCancelModal
                    ref={ref => this.modal = ref}
                    message={`Do you want to erase your order (${orderStore.totalText}) at ${this.currentBarName}?`}
                    onConfirm={this.props.onConfirm}
                    />
    }
}

@observer
export class BarCard extends PureComponent {
    /* properties:
        bar: Bar
        borderRadius: Int
        imageHeight: Int
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
        footer: Component
            footer to show in the bar card
        onPress: () => void
        onBack: ?() => void
        showBackButton: Bool
    */

    static defaultProps = {
        imageHeight: 200,
        borderRadius: 5,
    }

    render = () => {
        return <View style={{flex: 1}}>
            <TouchableOpacity
                    onPress={this.props.onPress}
                    style={{flex: 2, borderRadius: this.props.borderRadius}}
                    >
                <BarPhoto {...this.props} />
            </TouchableOpacity>
        </View>
    }

}

@observer
export class LazyBarPhoto extends PureComponent {
    static defaultProps = {
        showMapButton: false,
    }

    render = () => {
        return <LazyComponent
                    timeout={this.props.timeout || 0}
                    style={{height: this.props.imageHeight}}
                    >
            <BarPhoto {...this.props} />
        </LazyComponent>
    }
}

@observer
export class BarPhoto extends PureComponent {
    /* properties:
        photo: Photo
        bar: Bar
        imageHeight: Int
        showBackButton: Bool
        onBack: () => void
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
    */
    render = () => {
        var photo = this.props.photo
        const pictureIsGeneric = !photo
        if (!photo) {
            photo = {
                url: '/static/GenericBarPicture.jpg',
                htmlAttrib: [],
            }
        }

        return <PhotoImage
                    key={photo.url}
                    photo={photo}
                    style={{flex: 0, height: this.props.imageHeight}}
                    >
            <BackButton
                onBack={this.props.onBack}
                enabled={this.props.showBackButton}
                />
            {
                /*
                this.props.showBackButton
                    ? <TouchableOpacity onPress={this.props.onBack}>
                        <View style={
                                { width: 55
                                , height: 55
                                , justifyContent: 'center'
                                , alignItems: 'center'
                                , backgroundColor: 'rgba(0,0,0,0)'
                                }
                            }>
                            <MaterialIcon name="arrow-back" size={30} color='#fff' />
                        </View>
                      </TouchableOpacity>
                    : <View style={{flex: 1}} />
                */
            }
            <BarCardHeader
                pictureIsGeneric={pictureIsGeneric}
                style={{flex: 3}} />
            <LinearGradient style={{flex: 5}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0)'}}>
                    <BarCardFooter
                        bar={this.props.bar}
                        showDistance={this.props.showDistance}
                        showTimeInfo={this.props.showTimeInfo}
                        showBarName={this.props.showBarName}
                        showMapButton={this.props.showMapButton}
                        />
                </View>
            </LinearGradient>
        </PhotoImage>
    }
}

@observer
export class BarCardHeader extends PureComponent {
    /* properties:
        style: style object
        pictureIsGeneric: Bool
    */
    render = () => {
        if (this.props.pictureIsGeneric)
            return this.renderGenericPictureHeader()
        return <View style={this.props.style} />
    }

    renderGenericPictureHeader = () => {
        return <LinearGradient
                    style={this.props.style}
                    colors={['rgba(0, 0, 0, 1.0)', 'rgba(0, 0, 0, 0.0)']}
                    >
            <View style={
                    { flex: 1
                    , flexDirection: 'row'
                    , justifyContent: 'flex-end'
                    , marginRight: 5
                    , backgroundColor: 'rgba(0,0,0,0)' /* iOS */
                    }
                }>
                <T style={{fontSize: 15, color: '#fff'}}>
                    (No picture available)
                </T>
            </View>
        </LinearGradient>
    }
}

@observer
export class BarCardFooter extends PureComponent {
    /* properties:
        bar: schema.Bar
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
    */

    static defaultProps = {
        showDistance: false,
        showTimeInfo: true,
        showBarName: true,
        showMapButton: true,
    }

    handleFocusBarOnMap = () => {
        // Update currently selected bar on map
    }

    render = () => {
        const bar = this.props.bar
        return <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
            <View style={{flex : 1, marginLeft: 5, flexWrap: 'wrap'}}>
                <View style={{flexDirection: 'row'}}>
                    {this.props.showTimeInfo && <TimeInfo bar={bar} />}
                    {this.props.showDistance && <Distance bar={bar} />}
                </View>
                {this.props.showBarName && <BarName barName={bar.name} />}
            </View>
            {
                this.props.showMapButton &&
                    <View style={{justifyContent: 'flex-end', marginRight: 5}}>
                          <PlaceInfo bar={bar} />
                    </View>
            }
        </View>
    }
}

@observer
export class BarName extends PureComponent {
    /* properties:
        barName: String
    */
    render = () => {
        return <T style={
                    { fontSize: 22
                    , color: config.theme.primary.light
                    // , color: config.theme.primary.medium
                    // , color: '#fff'
                    // , color: '#000'
                    }}
                    ellipsizeMode='clip'
                    numberOfLines={2}
                    >
            {this.props.barName}
        </T>
    }
}

@observer
export class PlaceInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */

    styles = StyleSheet.create({
        buttonStyle: {
            width: 50,
            height: 50,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        },
        buttonItems: {
            margin: 5,
            alignItems: 'center',
        },
    })

    handlePress = () => {
        tabStore.setCurrentTab(0)
        mapStore.focusBar(this.props.bar, true, track = true)
        // mapStore.currentMarker = this.props.bar
        // TODO: Scroll to top
    }

    render = () => {
        return <View>
            <TouchableOpacity onPress={this.handlePress} style={this.styles.buttonStyle}>
                <View style={this.styles.buttonItems}>
                    <Icon name="map-marker" size={30} color="rgb(181, 42, 11)" />
                    <T style={{color: '#fff', fontSize: 14}}>
                        MAP
                        {/*this.props.bar.address.city*/}
                    </T>
                </View>
            </TouchableOpacity>
        </View>
    }
}

export const timeTextStyle = {fontSize: 11, color: '#fff'}

@observer
export class TimeInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
    render = () => {
        const openingTime = getBarOpenTime(this.props.bar)
        return <View style={{flexDirection: 'row', alignItems: 'flex-end',  marginRight: 10}}>
            <Icon name="clock-o" size={15} color='#fff' />
            <View style={{marginLeft: 5, flexDirection: 'row'}}>
                {
                    openingTime
                        ? this.renderOpeningTime(openingTime)
                        : this.renderUnknownOpeningTime()
                }
            </View>
        </View>
    }

    renderOpeningTime = (openingTime : OpeningTime) => {
        return <OpeningTimeView
                    openingTime={openingTime}
                    textStyle={timeTextStyle} />
    }

    renderUnknownOpeningTime = () => {
        var text
        if (this.props.bar.openNow != null) {
            if (this.props.bar.openNow)
                text = "open"
            else
                text = "closed"
        } else {
            text = "unknown"
        }

        return <T style={timeTextStyle}>{text}</T>
    }
}

@observer
export class OpeningTimeView extends PureComponent {
    /* properties:
        openingTime: OpeningTime
        textStyle: style object
    */

    styles = StyleSheet.create({
        row: {
            flexDirection: 'row',
            alignItems: 'center',
        }
    })

    render = () => {
        const textStyle = this.props.textStyle
        const openingTime = this.props.openingTime
        if (!openingTime)
            return <T style={textStyle}>Unknown</T>
        return <View style={this.styles.row}>
            <Time style={textStyle} time={openingTime.open} />
            <T style={textStyle}> - </T>
            <Time style={textStyle} time={openingTime.close} />
        </View>
    }
}

@observer
class Distance extends PureComponent {
    /* properties:
        bar: Bar
    */

    @computed get distance() {
        return mapStore.distanceFromUser(this.props.bar)
    }

    @computed get distanceString() {
        return formatDistance(this.distance)
    }

    render = () => {
        return <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Icon name="location-arrow" size={15} color='#fff' />
            <View style={{marginLeft: 5, flexDirection: 'row'}}>
                <T style={timeTextStyle}>{this.distanceString}</T>
            </View>
        </View>
    }
}

const formatDistance = (dist) => {
    if (dist < 0)
        return 'unknown'
    if (dist < 1000) {
        const meters = Math.round(dist / 100) * 100
        return `${meters.toFixed(0)} meters`
    }
    const km = dist / 1000
    return `${km.toFixed(1)}km`
}

@observer
export class Time extends PureComponent {
    /* properties:
        time: Time
        style: text style
    */
    render = () => {
        const time = this.props.time
        var minute = '' + time.minute
        if (minute.length === 1)
            minute = '0' + minute
        return <T style={this.props.style}>
            {time.hour}.{minute}
        </T>
    }
}
