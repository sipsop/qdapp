import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import Swiper from 'react-native-swiper'
import { observable, autorun } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/FontAwesome'

import { DownloadResultView } from './HTTP.js'
import { sampleBarMenu } from './BarMenu.js'
import { BarCardFooter } from './BarCard.js'
import { ImageSwiper } from './ImageSwiper.js'
import { Button } from './Button.js'
import { T } from './AppText.js'
import { store } from './Store.js'
import { config } from './Config.js'
import { merge } from './Curry.js'

@observer export class BarPage extends DownloadResultView {
    /* properties:
        width: int
        height: int
    */

    @observable autoplay = true

    constructor(props) {
        super(props, "Error downloading bar page")
        const { height, width} = Dimensions.get('screen')
        this.state = {width: width, height: height} // approximate width and height
        this.timer = undefined
        autorun(() => {
            /* Whenever store.bar changes, reinitialize autoplay to `true`
               and cancel any timers that are going to set it to `false`
            */
            store.bar
            this.autoplay = true
            if (this.timer) {
                clearTimeout(this.timer)
                this.timer = undefined
            }
        })
    }

    handleFocusBarOnMap = () => {

    }

    refreshPage = () => {
        if (store.barID) {
            store.setBarID(store.barID)
        }
    }
    getDownloadResult = () => store.bar

    renderNotStarted = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button
                label="Please select a bar first"
                onPress={() => {store.setCurrentTab(0)}}
                />
        </View>

    renderFinished = (bar) => {
        const imageHeight = 300
        const timeout = 3.0 // switch to next image after 3 seconds
        if (this.autoplay) {
            this.timer = setTimeout(
                () => { this.autoplay = false },
                (timeout * bar.images.length) * 1000,
            )
        }
        return (
            <ScrollView>
                <ImageSwiper
                    /* showButtons={true} */
                    height={imageHeight}
                    autoplay={this.autoplay}
                    autoplayTimeout={timeout}
                    >
                    {bar.images.map((url, i) =>
                        <Image
                            source={{uri: url}}
                            key={i}
                            style={{flex: 1, height: imageHeight}}
                            >
                            <View style={{flex: 1}} />
                            <LinearGradient style={{flex: 1}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                                    <BarCardFooter bar={bar} showMapButton={false} />
                                </View>
                            </LinearGradient>
                        </Image>
                        )
                    }
                </ImageSwiper>
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
                    <TouchableOpacity
                            style={{flex: 1}}
                            onPress={this.handleFavorite}
                            >
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <Icon
                                name="heart-o"
                                size={40}
                                color={config.theme.primary.medium}
                                />
                            <T style={{color: '#000000'}}>SAVE</T>
                        </View>
                    </TouchableOpacity>
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
                    {sampleBarMenu(bar)}
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
            </ScrollView>
        )
    }
}

const formatAddress = (address) => {
    return `${address.number} ${address.street}, ${address.city}, ${address.postcode}`
}

class InfoItem extends Component {
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
