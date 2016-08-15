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
        labelGroups: [[str]]
        index: int
    */

    render = () => {
        const labelGroups = this.props.labelGroups
        const backgroundColor = this.props.index % 2 == 0
            ? config.theme.primary.medium
            : config.theme.primary.dark

        const lastIdx = labelGroups.length - 1

        const groups = labelGroups.map((labels, i) =>
            <ButtonGroup
                key={i}
                labels={labels}
                showBar={i < lastIdx}
                />
        )

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
                    {groups}
                </View>
                <TouchableOpacity onPress={this.handleClearRow}>
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
    */

    @observable activeLabels = null

    constructor(props) {
        super(props)
        /* NOTE Maps do not seem to trigger updates from MobX */
        this.activeLabels = []
    }

    toggleButton = (label) => {
        if (this.isActive(label)) {
            const i = _.find(this.activeLabels, label)
            this.activeLabels.splice(i, 1)
        } else {
            this.activeLabels.push(label)
        }
    }

    _isActive = (label) => {
        return _.includes(this.activeLabels, label)
    }

    isActive = (label) => {
        console.log("is active", label, this._isActive(label))
        return this._isActive(label)
    }

    handleClearRow = () => {
        this.activeLabels.clear()
    }

    render = () => {
        const labels = this.props.labels
        return (
            <View style={{flex: 1, height: 30, borderRightWidth: 0.5, borderColor: '#fff', paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center'}}>
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
                                onPress={() => this.toggleButton(label)}
                                active={this.isActive(label)}
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
    */
    render = () => {
        const active = this.props.active
        return (
            <View style={{minWidth: 60}}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <T style={
                            { textAlign: 'center'
                            , fontSize: 16
                            , color: '#fff'
                            , textDecorationLine: active ? 'underline' : 'none'
                            }
                        }>
                        {this.props.label}
                    </T>
                </TouchableOpacity>
            </View>
        )
    }
}
