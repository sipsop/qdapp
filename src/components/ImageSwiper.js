import React, { Component } from 'react';
import {
  StyleSheet,
  T,
  Text,
  View,
} from '/components/Component.js'
import Swiper from 'react-native-swiper'
import { config } from '/utils/config.js'

// TODO: Check out this one:
//
//      https://github.com/race604/react-native-viewpager
//
// Perhaps it is less buggy? It also supports lazy loading.


export class ImageSwiper extends Component {
    /* properties:
        height: int
        showButtons: bool
        children: [Image]
        width: int
            optional width (otherwise it takes up the full screen width)
        autoplay: bool
        autoplayTimeout: float
    */

    static defaultProps = {
        showButtons:        false,
        autoplay:           false,
        autoplayTimeout:    4.0,   // timeout in seconds
    }

    render = () => {
        const dot = <View style={dotStyles.dotStyle} />
        const activeDot = <View style={dotStyles.activeDotStyle} />
        const prevButton = <Text style={buttonStyles.buttonTextStyle}>&#xab;</Text>
        const nextButton = <Text style={buttonStyles.buttonTextStyle}>&#xbb;</Text>
        return <Swiper
                    showsButtons={this.props.showButtons}
                    height={this.props.height}
                    dot={dot}
                    activeDot={activeDot}
                    prevButton={prevButton}
                    nextButton={nextButton}
                    width={this.props.width}
                    autoplay={this.props.autoplay}
                    autoplayTimeout={this.props.autoplayTimeout}
                    >
            {this.props.children}
        </Swiper>
    }
}

const dotStyles = StyleSheet.create({
    dotStyle: {
        backgroundColor: 'rgba(236, 230, 223, 0.5)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 10,
    },
    activeDotStyle: {
        backgroundColor: 'rgba(236, 230, 223, 0.9)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 10,
    }
})

const buttonStyles = StyleSheet.create({
    buttonTextStyle: {
        fontSize: 50,
        color: config.theme.primary.medium,
        // fontFamily: 'Arial',
    }
})
