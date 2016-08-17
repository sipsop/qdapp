import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'
// import PickerAndroid from 'react-native-picker-android';
// import merge from 'merge'
import _ from 'lodash'
import { observable, computed, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { Selector } from './Selector.js'
import { T } from './AppText.js'
import { Price } from './Price.js'
import { OkCancelModal } from './Modals.js'

export class PickerItem {
    /* Attributes:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        prices: [schema.Price]
            price corresponding to each label
        defaultOption: int
            index of default option
        selection: [int]
            currently selected items for this PickerItem
        multiple: bool
            whether multiple items may be selected
    */

    @observable selected

    constructor(title, labels, prices, defaultOption, selection, multiple) {
        this.title = title
        this.labels = labels
        this.prices = prices
        this.defaultOption = defaultOption
        this.selected = selection
        this.multiple = multiple
    }
}

@observer
export class PickerCollection extends PureComponent {
    /* properties:
        pickerItems: [PickerItem]
        onAcceptChanges([PickerItem]) -> void
    */

    @observable modalVisible = false

    showModal = () => {
        this.modalVisible = true
    }

    closeModal = () => {
        this.modalVisible = false
    }

    okModal = () => {
        this.props.onAcceptChanges(this.props.pickerItems)
        this.closeModal()
    }

    handleItemChange = (pickerItem, itemIndex) => {
        if (pickerItem.multiple) {
            if (!_.includes(pickerItem.selected, itemIndex)) {
                pickerItem.selected.push(itemIndex)
            }
        } else {
            pickerItem.selected[0] = itemIndex
        }
    }

    render = () => {
        const pickerItems = this.props.pickerItems
        const showOkButton = this.props.pickerItems.length > 1
                          || !this.props.pickerItems[0].multiple

        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            {
            <OkCancelModal
                    visible={this.modalVisible}
                    cancelModal={this.closeModal}
                    okModal={this.okModal}
                    showOkButton={showOkButton}
                    >
                {pickerItems.map(this.renderPicker)}
            </OkCancelModal>
            }
            {/*pickerItems.map(this.renderPicker)*/}
            <TouchableOpacity onPress={this.showModal}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1}}>
                    <T lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {this.renderLabels()}
                    </T>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
        </View>
    }

    renderPicker = (pickerItem, i) => {
        const onSelect = itemIndex => this.handleItemChange(pickerItem, itemIndex)
        return (
            <Selector
                    key={i}
                    selected={pickerItem.selected}
                    onSelect={onSelect}
                    >
                {
                    _.zipWith( pickerItem.labels
                             , pickerItem.prices
                             , _.range(pickerItem.labels.length)
                             , (label, price, i) => {
                        return <View key={i} style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{flex: 1, justifyContent: 'center'}}>
                                <T style={{fontSize: 20}}>{label}</T>
                            </View>
                            <Price price={price} style={{fontSize: 20}} />
                        </View>
                    })
                }
            </Selector>
        )
    }

    renderLabels = () => {
        /* Get all non-default labels */
        const nonDefaultLabels = this.props.pickerItems.map((pickerItem, i) => {
            if (pickerItem.selected.length == 1 &&
                    pickerItem.selected[0] == pickerItem.defaultOption) {
                return []
            }
            return pickerItem.selected.map(itemIndex => pickerItem.labels[itemIndex])
        })
        const labels = _.flatten(nonDefaultLabels)
        if (labels.length === 0) {
            const firstItem = this.props.pickerItems[0]
            return firstItem.labels[0]
        }
        return _.join(_.flatten(nonDefaultLabels), ' + ')
    }
}
