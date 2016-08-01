import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Swiper from 'react-native-swiper'

// TODO: Check out this one:
//
//      https://github.com/race604/react-native-viewpager
//
// Perhaps it is less buggy? It also supports lazy loading.


export class ImageSwiper extends Component {
    /* properties:
        height: int
        showsButtons: bool
        children: [Image]
    */

    render = () => {
        const dot = <View style={dotStyles.dotStyle} />
        const activeDot = <View style={dotStyles.activeDotStyle} />
        const prevButton = <Text style={buttonStyles.buttonTextStyle}>&#xab;</Text>
        const nextButton = <Text style={buttonStyles.buttonTextStyle}>&#xbb;</Text>
        return <Swiper
                    showsButtons={this.props.showsButtons}
                    height={this.props.height}
                    dot={dot}
                    activeDot={activeDot}
                    prevButton={prevButton}
                    nextButton={nextButton}
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
        marginBottom: 3,
    },
    activeDotStyle: {
        backgroundColor: 'rgba(236, 230, 223, 0.9)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    }
})

const buttonStyles = StyleSheet.create({
    buttonTextStyle: {
        fontSize: 50,
        color: 'rgba(236, 230, 223, 0.8)',
        // fontFamily: 'Arial',
    }
})
