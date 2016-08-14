import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  View,
  ScrollView,
  ListView,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import Swiper from 'react-native-swiper'
import { observable, autorun } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { DownloadResultView } from './HTTP.js'
import { sampleBarMenu } from './BarMenu.js'
import { BarCardFooter } from './BarCard.js'
import { ImageSwiper } from './ImageSwiper.js'
import { Button } from './Button.js'
import { T } from './AppText.js'
import { store } from './Store.js'
import { config } from './Config.js'

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
            <ScrollView style={{flex: 1, flexDirection: 'column'}}>
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
                    <BarCardFooter bar={bar} />
                </LinearGradient>
                <View style={
                        { flex: 1
                        , flexDirection: 'row'
                        , justifyContent: 'center'
                        , marginTop: 20
                        }
                    }>
                    <T style={
                        { fontSize: 20
                        , color: config.theme.primary.medium
                        }
                    }>
                        Menu
                    </T>
                </View>
                {sampleBarMenu(bar)}
            </ScrollView>
        )
    }
}
