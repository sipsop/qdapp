import React, { Component } from 'react';
import {
    Image,
    View,
    TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions';
import { transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { PureComponent } from '../Component.js'
import { T } from '../AppText.js'
import { PhotoImage } from '../Maps/Photos.js'
import { store, tabStore, mapStore } from '../Store.js'
import * as _ from '../Curry.js'
import { barStore, getBarOpenTime } from './BarStore.js'
import { config } from '../Config.js'

const white = 'rgba(255, 255, 255, 1.0)'

const log = _.logger('Bar/BarCard.js')

@observer export class BarCard extends PureComponent {
    /* properties:
        bar: schema.Bar
            bar info
    */

    handleCardPress = () => {
        transaction(() => {
            barStore.setBarID(this.props.bar.id)
            tabStore.setCurrentTab(1)
        })

    }

    render = () => {
        const bar = this.props.bar
        const imageHeight = 200
        const radius = 5

        // console.log("barcard: ", bar, bar.id, bar.name, bar.desc)
        // return <T>card here... {bar.id} {bar.name}</T>

        const imageStyle = {
            flex: 0,
            height: imageHeight,
            borderRadius: radius,
            // borderTopLeftRadius: radius,
            // borderTopRightRadius: radius,
        }

        const { height, width } = Dimensions.get('screen')

        log("Rendering bar card...", bar.photos)

        return <View style={{flex: 0, height: imageHeight, margin: 10, borderRadius: radius }}>
            <TouchableOpacity onPress={this.handleCardPress} style={{flex: 2, borderRadius: radius}}>
                <PhotoImage photo={bar.photos[0]} style={imageStyle}>
                    <View style={{flex: 1}}>
                        {/* Push footer to bottom */}
                        <View style={{flex: 1}} />
                        <LinearGradient style={{flex: 1}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                                <BarCardFooter bar={bar} />
                            </View>
                        </LinearGradient>
                    </View>
                </PhotoImage>
            </TouchableOpacity>
        </View>
    }

}

@observer export class BarCardFooter extends PureComponent {
    /* properties:
        bar: schema.Bar
        showMapButton: bool
        onCardPress:
            callback for when this card is pressed
    */

    static defaultProps = {
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
                <BarInfo bar={bar} />
            </View>
            {this.props.showMapButton ? mapButton : undefined}
        </View>
    }
}

@observer export class BarInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
    render = () => {
        return <View style={{justifyContent: 'flex-end'}}>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                <TimeInfo bar={this.props.bar} />
            </View>
            <T style={
                    { fontSize: 25
                    , color: config.theme.primary.medium
                    }}>
                {this.props.bar.name}
            </T>
        </View>
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
                <T style={{color: white, fontSize: 14}}>
                    MAP
                    {/*this.props.bar.address.city*/}
                </T>
            </TouchableOpacity>
        </View>
    }
}

const timeTextStyle = {fontSize: 11, color: white}

@observer
export class TimeInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
    render = () => {
        const openingTime = getBarOpenTime(this.props.bar)
        return <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Icon name="clock-o" size={15} color={white} />
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
        return <View style={{flexDirection: 'row'}}>
            <Time style={timeTextStyle} time={openingTime.open} />
            <T style={timeTextStyle}> - </T>
            <Time style={timeTextStyle} time={openingTime.close} />
        </View>
    }

    renderUnknownOpeningTime = () => {
        return <T style={timeTextStyle}>Unknown</T>
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
