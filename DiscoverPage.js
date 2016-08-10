import React, { Component } from 'react';
import {
  AppRegistry,
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native';
import Dimensions from 'Dimensions';
import _ from 'lodash'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { ImageSwiper } from './ImageSwiper.js'
import { BarMapView } from './BarMapView.js'
import { store } from './Store.js'
import { config } from './Config.js'


@observer export class DiscoverPage extends Component {
    render = () => {
        const barList = store.barList || []
        if (!barList.length)
            return this.renderLoader()

        return <ScrollView style={{flex: 1}}>
            <BarMapView />
            <View style={{flex: 1, marginTop: 10}}>
                <Text style={{marginLeft: 10, fontSize: 20, color: config.theme.primary.medium}}>
                    Nearby Bars
                </Text>
                {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
            </View>
        </ScrollView>
    }

    renderLoader = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
                animating={true}
                color={config.theme.primary.dark}
                size="large"
                />
        </View>
}

@observer class BarCard extends Component {
    /* properties:
        bar: schema.Bar
            bar info
    */

    handleCardPress = () => {
        store.setBarID(this.props.bar.id)
        // TODO: switch to bar page
    }

    render = () => {
        const bar = this.props.bar
        const viewHeight = 350
        const imageHeight = 250
        const radius = 5

        const imageStyle = {
            flex: 0,
            height: imageHeight,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
        }

        const { height, width } = Dimensions.get('screen')

        const renderImage = (url, i) =>
            <TouchableOpacity key={i} onPress={this.handleCardPress}>
                <Image source={{uri: url}} style={imageStyle} />
            </TouchableOpacity>

        return <View style={{flex: 0, height: 350, margin: 10, borderTopLeftRadius: radius, borderTopRightRadius: radius}}>
            <TouchableOpacity onPress={this.handleCardPress}>
                <Image source={{uri: bar.images[0]}} style={imageStyle} />
            </TouchableOpacity>
            {/*
            <ImageSwiper height={250} showButtons={true} width={width - 20}>
                {bar.images.map(renderImage)}
            </ImageSwiper>
            */}
            <BarCardFooter bar={bar} />
        </View>
    }

}

@observer class BarCardFooter extends Component {
    /* properties:
        bar: schema.Bar
        onCardPress:
            callback for when this card is pressed
    */

    handleFocusBarOnMap = () => {
        // Update currently selected bar on map
    }

    handleShowOpeningTimes = () => {
        // show opening times modal window
    }

    render = () => {
        const bar = this.props.bar

        const footerStyle = {
            // flexDirection: 'row',
            // alignItems: 'center',
            borderWidth: 1,
            // borderLeftWidth: 1,
            // borderBottomWidth: 1,
            // borderRightWidth: 1,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
        }

        return <View style={footerStyle}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 20}}>{bar.name}</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text>{bar.address.city}</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={{fontSize: 12, color: 'rgba(0, 0, 0, 0.50)'}}>
                        11.00 - 23.30
                    </Text>
                </View>
            </View>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 10, color: "rgba(0, 0, 0, 0.50)"}}>#pub #food #garden</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Icon name="map-marker" size={30} color="rgb(181, 42, 11)" />
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Icon name="clock-o" size={20} color="rgba(0, 0, 0, 0.50)" />
                </View>
            </View>
        </View>

        /*
        const footerStyle = {
            flexDirection: 'row',
            // alignItems: 'center',
            borderWidth: 1,
            // borderLeftWidth: 1,
            // borderBottomWidth: 1,
            // borderRightWidth: 1,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
        }


        return <View style={footerStyle}>
            <TouchableOpacity style={{flex: 1}} onPress={this.props.onCardPress}>
                <Text style={{fontSize: 20}}>{bar.name}</Text>
                <Text style={{fontSize: 10, color: "rgba(0, 0, 0, 0.50)"}}>#pub #food #garden</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}} onPress={this.handleFocusBarOnMap}>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <Text style={{marginRight: 5}}>{bar.address.city}</Text>
                    <Icon name="map-marker" size={25} color="rgb(181, 42, 11)" />
                </View>
            </TouchableOpacity>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                <TouchableOpacity onPress={this.handleShowOpeningTimes}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{textAlign: 'right', fontSize: 12, color: 'rgba(0, 0, 0, 0.50)', marginRight: 5}}>
                            11.00 - 23.30
                        </Text>
                        <Icon name="clock-o" size={20} color="rgba(0, 0, 0, 0.50)" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
        */
    }
}
