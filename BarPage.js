import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import Swiper from 'react-native-swiper'
// import Carousel from 'react-native-carousel'
// import Carousel from 'react-native-carousel-control'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { SampleBarMenu } from './BarMenu.js'
import { BarCardFooter } from './BarCard.js'
import { ImageSwiper } from './ImageSwiper.js'
import { SizeTracker } from './SizeTracker.js'
import { store } from './Store.js'

@observer export class BarPage extends SizeTracker {
    /* properties:
        width: int
        height: int
    */

    constructor(props) {
        super(props)
        const { height, width} = Dimensions.get('screen')
        this.state = {width: width, height: height} // approximate width and height
    }

    renderNoBarSelected = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Please select a bar first.</Text>
        </View>
    }

    render() {
        const imageHeight = this.state.height / 2
        if (!store.bar)
            return this.renderNoBarSelected()

        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <ImageSwiper showButtons={true} height={imageHeight}>
                    {store.bar.images.map((url, i) =>
                        <Image
                            source={{uri: url}}
                            key={i}
                            style={{flex: 1, height: imageHeight}}
                            />
                        )
                    }
                </ImageSwiper>
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
                    <BarCardFooter bar={store.bar} />
                </LinearGradient>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
                    <Text style={{fontSize: 18}}>Menu</Text>
                </View>
                <SampleBarMenu />
            </View>
        )
    }
}

const barTitleStyle = StyleSheet.create({
    // children
    barTitleText: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: 'rgba(255, 255, 255, 0.80)'
    },
    barTitleInfo: {
        flex: 1,
        fontSize: 15,
        textAlign: 'center',
        margin: 10,
    },
});
