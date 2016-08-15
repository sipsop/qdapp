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
    */
    render = () => {
        const labels = this.props.labels
        return (
            <View style={{flex: 1, height: 30, borderRightWidth: 0.5, borderColor: '#fff', paddingLeft: 5, paddingRight: 5}}>
                <ScrollView
                        horizontal={true}
                        style={{height: 30}}
                        contentContainerStyle={{alignItems: 'center'}}
                        >
                    {
                        labels.map((label, i) =>
                            <SelectableButton
                                key={i}
                                label={label}
                                onPress={() => this.props.toggleButton(label)}
                                active={this.props.isActive(label)}
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
        onPress: callback
        renderLabel: str -> Component
    */
    render = () => {
        const active = this.props.active
        return (
            <View style={{paddingLeft: 15, paddingRight: 15}}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <T style={
                            { /*textAlign: 'center'
                            , */ fontSize: 16
                            , color: '#fff'
                            , textDecorationLine: active ? 'underline' : 'none'
                            , borderWidth: 1
                            }
                        }>
                        {this.props.renderLabel(this.props.label)}
                    </T>
                </TouchableOpacity>
            </View>
        )
    }
}
