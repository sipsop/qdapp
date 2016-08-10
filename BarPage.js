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
import Carousel from 'react-native-carousel-control'

import { SampleBarMenu } from './BarMenu.js'
import { ImageSwiper } from './ImageSwiper.js'
import { SizeTracker } from './SizeTracker.js'

class Images extends Component {
    /* properties:
        height: int
    */
    render = () => {
        const height = this.props.height
        const outsideURL = "http://blog.laterooms.com/wp-content/uploads/2014/01/The-Eagle-Cambridge.jpg"
        const insideURL = "http://www.vintagewings.ca/Portals/0/Vintage_Stories/News%20Stories%20L/EaglePubRedux/Eagle14.jpg"
        return <ImageSwiper showButtons={true} height={height}>
            <Image source={{uri: outsideURL}} style={{flex: 1, height: height}} />
            <Image source={{uri: insideURL}} style={{flex: 1, height: height}} />
        </ImageSwiper>
    }
}

export class BarPage extends SizeTracker {
    /* properties:
        width: int
        height: int
    */

    constructor(props) {
        super(props)
        const { height, width} = Dimensions.get('screen')
        this.state = {width: width, height: height} // approximate width and height
    }

    render() {
        const imageHeight = this.state.height / 2

        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <Images height={imageHeight} />
                <View style={contentStyle.title}>
                    <Text style={barTitleStyle.barTitleText}>
                        The Eagle
                    </Text>
                </View>
                <View style={contentStyle.menu}>
                    <Text style={contentStyle.menuText}>Menu</Text>
                </View>
                <SampleBarMenu />
            </View>
        )
    }
}

// const beerImg = "http://cdn.funcheap.com/wp-content/uploads/2016/06/beer1.jpg"
const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

var carouselStyles = StyleSheet.create({
  container: {
    width: 400,
    height: 200,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'transparent',
    borderWidth: 1,
    margin: 10,
  },
})

const contentStyle = StyleSheet.create({
    main: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#D7CCC8',
    },
    picture: {
        flex: 1,
        flexDirection: 'row',
        height: 400,
    },
    title: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50, // TODO: remove
        backgroundColor: "#B0BEC5",
    },
    fill: {
        flex: 1,
    },
    menu: {
        flexDirection:  'row',
        justifyContent: 'center',
        marginTop:      20,
    },
    menuText: {
        fontSize: 18,
    },
});

const barImageStyle = StyleSheet.create({
    barImage: {
        flex: 1,
        flexDirection: 'row',
    }
})

const barTitleStyle = StyleSheet.create({
    // children
    barTitleText: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    barTitleInfo: {
        flex: 1,
        fontSize: 15,
        textAlign: 'center',
        margin: 10,
    },
});
