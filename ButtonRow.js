import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import Swiper from 'react-native-swiper'
import { observable, autorun } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { DownloadResultView } from './HTTP.js'
import { sampleBarMenu } from './BarMenu.js'
import { BarCardFooter } from './BarCard.js'
import { ImageSwiper } from './ImageSwiper.js'
import { T } from './AppText.js'
import { store } from './Store.js'
import { config } from './Config.js'
import { intersperse, merge } from './Curry.js'

@observer
export class ButtonRow extends Component {
    /* properties:
        rowNumber: int
        clearRow() -> void
            callback invoked to clear the row
    */

    render = () => {
        const backgroundColor = this.props.rowNumber % 2 == 0
            ? config.theme.primary.medium
            : config.theme.primary.dark

        return (
            <View style={
                    { flex: 1
                    , backgroundColor: backgroundColor
                    , flexDirection: 'row'
                    , justifyContent: 'flex-start'
                    , alignItems: 'center'
                    , height: 40
                    }
                }>
                <View style={{flexDirection: 'row', flex: 1}}>
                    {this.props.children}
                </View>
                <TouchableOpacity onPress={this.props.clearRow}>
                    <EvilIcon name="close-o" size={35} color="#ffffff" />
                </TouchableOpacity>
            </View>
        )
    }
}

@observer
export class ButtonGroup extends Component {
    /* properties:
        labels: [str]
        showBar: bool
        toggleButton(label) -> void
        renderLabel: str -> Component
        isActive(label) -> bool
            callback that returns whether the button is selected
        isDisabled(label) -> bool
    */
    render = () => {
        const labels = this.props.labels
        return (
            <View style={{flex: 1, height: 40, /* borderRightWidth: 0.5, borderColor: '#fff',*/ paddingLeft: 5, paddingRight: 5}}>
                <ScrollView
                        horizontal={true}
                        style={{height: 40}}
                        contentContainerStyle={{alignItems: 'center'}}
                        >
                    {
                        labels.map((label, i) =>
                            <SelectableButton
                                key={i}
                                label={label}
                                onPress={() => this.props.toggleButton(label)}
                                active={this.props.isActive(label)}
                                disabled={this.props.isDisabled(label)}
                                renderLabel={this.props.renderLabel}
                                />
                        )
                    }
                </ScrollView>
            </View>
        )
    }
}

@observer
export class SelectableButton extends Component {
    /* properties:
        label: str
        active: bool
            whether this button has been selected/switched on
        disabled: bool
            whether this button should be disabled
        onPress: callback
        renderLabel: str -> Component
    */
    render = () => {
        var textDecoration = 'none'
        var opacity = 0.85
        var fontWeight = 'normal'
        if (this.props.active) {
            opacity = 1.0
            textDecoration = 'underline'
            fontWeight = '900'
        } else if (this.props.disabled) {
            opacity = 0.70
            textDecoration = 'line-through'
        }

        const textColor = `rgba(255, 255, 255, ${opacity})`

        var button = <T style={
                { paddingLeft: 15
                , paddingRight: 15
                , fontSize: 16
                , color: textColor
                , textDecorationLine: textDecoration
                , fontWeight: fontWeight
                , textAlign: 'center'
                }
            }>
            {this.props.renderLabel(this.props.label)}
        </T>

        if (this.props.active) {
            button = <LinearGradient
                    style={{ flex: 1
                           , justifyContent: 'center'
                           , alignItems: 'center'
                           , borderRadius: 5
                          }}
                    colors={[ 'rgba(255, 255, 255, 0.3)'
                            , 'rgba(255, 255, 255, 0.6)'
                            ]}
                    >
                {button}
            </LinearGradient>
        }

        if (!this.props.disabled) {
            button = <TouchableOpacity
                        style={{flex: 1, borderRadius: 5}}
                        onPress={this.props.onPress}
                        >
                <View style={{flex: 1, borderRadius: 5, justifyContent: 'center', alignItems: 'center'}}>
                    {button}
                </View>
             </TouchableOpacity>
        }

        return <View style={
                { height: 30
                , justifyContent: 'center'
                , borderWidth: 0.5
                , borderColor: '#fff'
                , marginLeft: 2
                , marginRight: 2
                // , marginTop: 5
                // , marginBottom: 5
                , borderRadius: 5
                }}>
            {button}
        </View>
    }
}
