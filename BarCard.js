import React, { Component } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import Dimensions from 'Dimensions';
import _ from 'lodash'
import { transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { T } from './AppText.js'
import { ImageSwiper } from './ImageSwiper.js'
import { locationStore } from './BarMap.js'
import { store } from './Store.js'
import { config } from './Config.js'

const white = 'rgba(255, 255, 255, 1.0)'

@observer export class BarCard extends Component {
    /* properties:
        bar: schema.Bar
            bar info
    */

    handleCardPress = () => {
        transaction(() => {
            store.setBarID(this.props.bar.id)
            store.setCurrentTab(1)
        })

    }

    render = () => {
        const bar = this.props.bar
        const viewHeight = 350
        const imageHeight = 250
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

        return <View style={{flex: 0, height: 350, margin: 10, borderRadius: radius, /*borderTopLeftRadius: radius, borderTopRightRadius: radius */}}>
            <TouchableOpacity onPress={this.handleCardPress} style={{flex: 2, borderRadius: radius}}>
                <Image source={{uri: bar.images[0]}} style={imageStyle}>
                    <View style={{flex: 1}}>
                        {/* Push footer to bottom */}
                        <View style={{flex: 1}} />
                        <LinearGradient style={{flex: 1}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                                <BarCardFooter bar={bar} />
                            </View>
                        </LinearGradient>
                    </View>
                </Image>
            </TouchableOpacity>
        </View>
    }

}

@observer export class BarCardFooter extends Component {
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

@observer export class BarInfo extends Component {
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

@observer export class PlaceInfo extends Component {
    /* properties:
        bar: schema.Bar
    */

    handlePress = () => {
        store.setCurrentTab(0)
        locationStore.currentMarker = this.props.bar
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

@observer export class TimeInfo extends Component {
    /* properties:
        bar: schema.Bar
    */
    render = () => {
        return <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Icon name="clock-o" size={15} color={white} />
            <T style={{marginLeft: 5, fontSize: 11, color: white}}>
                11.00 - 23.30
            </T>
        </View>
    }
}
