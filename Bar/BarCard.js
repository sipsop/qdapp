import {
    React,
    Component,
    View,
    TouchableOpacity,
    MaterialIcon,
    PureComponent,
    Dimensions,
    T,
} from '../Component.js'
import { action, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { LazyComponent } from '../LazyComponent.js'
import { SmallOkCancelModal } from '../Modals.js'
import { BackButton } from '../BackButton.js'
import { PhotoImage } from '../Maps/Photos.js'
import { store, tabStore, mapStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'
import { barStore, getBarOpenTime } from './BarStore.js'
import { config } from '../Config.js'

const { log, assert } = _.utils('./Bar/BarCard.js')

@observer
export class DiscoverBarCard extends PureComponent {
    /* properties:
        borderRadius: Int
        imageHeight: Int
        bar: Bar
            bar info
    */
    modal = null

    static defaultProps = {
        borderRadius: 5,
    }

    handleCardPress = () => {
        if (orderStore.orderList.length > 0 && this.props.bar.id !== barStore.barID)
            this.modal.show()
        else
            this.setBar()
    }

    @action setBar = () => {
        barStore.setBarID(this.props.bar.id)
        tabStore.setCurrentTab(1)
    }

    render = () => {
        const currentBar = barStore.getBar()
        const currentBarName = currentBar ? currentBar.name : ""
        const photos = this.props.bar.photos
        const useGenericPicture = !photos || !photos.length

        return <View style={
                { flex: 0
                , height: this.props.imageHeight
                , marginTop: 5
                , marginLeft: 5
                , marginRight: 5
                , borderRadius: this.props.borderRadius
                }
            }>
            <SmallOkCancelModal
                ref={ref => this.modal = ref}
                message={`Do you want to erase your order (${orderStore.totalText}) at ${currentBarName}?`}
                onConfirm={this.setBar}
                />
            <BarCard
                {...this.props}
                photo={photos && photos.length && photos[0]}
                onPress={this.handleCardPress} />
        </View>
    }
}

@observer
export class BarCard extends PureComponent {
    /* properties:
        bar: Bar
        borderRadius: Int
        imageHeight: Int
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
        footer: Component
            footer to show in the bar card
        onPress: () => void
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
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
    */

    static defaultProps = {
        showTimeInfo: true,
        showBarName: true,
        showMapButton: true,
    }

    handleFocusBarOnMap = () => {
        // Update currently selected bar on map
    }

    render = () => {
        const bar = this.props.bar
        const mapButton = (
            <View style={{justifyContent: 'flex-end', marginRight: 5}}>
                  <PlaceInfo bar={bar} />
            </View>
        )

        return <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
            <View style={{flex : 1, marginLeft: 5}}>
                {this.props.showTimeInfo && <TimeInfo bar={bar} />}
                {this.props.showBarName && <BarName barName={bar.name} />}
            </View>
            {this.props.showMapButton && mapButton}
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
                    { fontSize: 25
                    , color: config.theme.primary.light
                    // , color: config.theme.primary.medium
                    // , color: '#fff'
                    // , color: '#000'
                    }}>
            {this.props.barName}
        </T>
    }
}

@observer
export class PlaceInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */

    handlePress = () => {
        tabStore.setCurrentTab(0)
        mapStore.focusBar(this.props.bar)
        // mapStore.currentMarker = this.props.bar
        // TODO: Scroll to top
    }

    render = () => {
        return <View>
            <TouchableOpacity onPress={this.handlePress}>
                <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                    <Icon name="map-marker" size={30} color="rgb(181, 42, 11)" />
                </View>
                <T style={{color: '#fff', fontSize: 14}}>
                    MAP
                    {/*this.props.bar.address.city*/}
                </T>
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
        return <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
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
        return <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Time style={timeTextStyle} time={openingTime.open} />
            <T style={timeTextStyle}> - </T>
            <Time style={timeTextStyle} time={openingTime.close} />
        </View>
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
