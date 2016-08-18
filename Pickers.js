import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'
// import PickerAndroid from 'react-native-picker-android';
// import merge from 'merge'
import _ from 'lodash'
import { observable, computed, autorun, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { updateSelection, getFlags, updateFlagsInPlace } from './Selection.js'
import { Selector } from './Selector.js'
import { T } from './AppText.js'
import { Price } from './Price.js'
import { OkCancelModal } from './Modals.js'
import { config } from './Config.js'
import { TextButton, Button } from './Button.js'

export class PickerItem {
    /* Attributes:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        prices: [schema.Price]
            price corresponding to each label
        defaultOption: int
            index of default option
            If there is no default, set to -1.
        selection: [int]
            currently selected items for this PickerItem
        optionType: str
            'Single' | 'ZeroOrMore' | 'OneOrMore'
    */

    @observable selected
    @observable selectedInModal

    constructor(title, labels, prices, defaultOption, selection, optionType) {
        this.title = title
        this.labels = labels
        this.prices = prices
        this.defaultOption = defaultOption
        this.selected = selection
        this.selectedInModal = this.selected.map(i => i)
        this.optionType = optionType
        autorun(() => {
            this.selectedInModal = this.selected.map(i => i)
        })
    }
}

@observer
export class PickerCollection extends PureComponent {
    /* properties:
        pickerItems: [PickerItem]
        onAcceptChanges([PickerItem]) -> void
        rowNumber: int
    */

    @observable modalVisible = false

    showModal = () => {
        this.modalVisible = true
    }

    closeModal = () => {
        this.modalVisible = false
    }

    okModal = () => {
        transaction(() => {
            this.props.pickerItems.forEach(pickerItem => {
                pickerItem.selected = pickerItem.selectedInModal
            })
            this.props.onAcceptChanges(this.props.pickerItems)
            this.closeModal()
        })
    }

    render = () => {
        const pickerItems = this.props.pickerItems

        var modal = undefined
        if (this.modalVisible) {
            const showOkButton = pickerItems.length > 1 || pickerItems[0].optionType !== 'Single'
            modal = <OkCancelModal
                    visible={this.modalVisible}
                    cancelModal={this.closeModal}
                    okModal={this.okModal}
                    showOkButton={showOkButton}
                    >
                {/*<ScrollView>*/}
                    {
                        pickerItems.map(
                            (pickerItem, i) =>
                                <PickerItemView
                                    key={i}
                                    pickerItem={pickerItem}
                                    confirmImmediately={!showOkButton}
                                    confirmSelection={this.okModal}
                                    />
                        )
                    }
                {/*</ScrollView>*/}
              </OkCancelModal>
        }

        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            {modal}
            <PickerButton
                pickerItems={pickerItems}
                showModal={this.showModal}
                rowNumber={this.props.rowNumber}
                />
        </View>
    }
}

@observer
class PickerItemView extends PureComponent {
    /* properties:
        pickerItem: PickerItem
        confirmImmediately: bool
            whether to confirm the selection on a single press
        confirmSelection() -> void
            confirm a new selection by closing the modal
    */

    @observable flags

    constructor(props) {
        super(props)
        const length = props.pickerItem.labels.length

        const pickerItem = this.props.pickerItem
        transaction(() => {
            this.flags = getFlags(length)
            updateFlagsInPlace(pickerItem.selectedInModal, this.flags)
        })

        autorun(() => {
            updateFlagsInPlace(pickerItem.selectedInModal, this.flags)
        })
    }

    handleItemChange = (itemIndex) => {
        const pickerItem = this.props.pickerItem
        pickerItem.selectedInModal = updateSelection(
            pickerItem.optionType,
            pickerItem.selectedInModal,
            itemIndex,
        )
        if (this.props.confirmImmediately)
            this.props.confirmSelection()
    }

    render = () => {
        const pickerItem = this.props.pickerItem
        return (
            <View style={{flex: 1, justifyContent: 'center'}}>
                <T style={
                        { fontSize: 25
                        , color: '#000'
                        , textDecorationLine: 'underline'
                        , marginLeft: 5
                        }
                    }>
                    {pickerItem.title}
                </T>
                <Selector
                        flags={this.flags}
                        onSelect={this.handleItemChange}
                        renderRow={this.renderRow}
                        >
                </Selector>
            </View>
        )
    }

    renderRow = (i) => {
        const pickerItem = this.props.pickerItem
        const label = pickerItem.labels[i]
        const price = pickerItem.prices[i]
        const textStyle = {fontSize: 20, color: '#000'}
        return <View key={i} style={
                { flex: 1
                , flexDirection: 'row'
                , alignItems: 'center'
                , paddingLeft: 10
                , paddingRight: 10
                }
            }>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <T style={textStyle}>{label}</T>
            </View>
            <Price price={price} style={textStyle} />
        </View>
    }
}

@observer
class PickerButton extends PureComponent {
    /* properties:
        pickerItems: [PickerItem]
        showModal() -> void
            callback to trigger modal popup
        rowNumber: int
    */
    render = () => {
        return <TextButton
                    label={this.renderLabels()}
                    fontSize={16}
                    onPress={this.props.showModal}
                    style={{flex: 1}}
                    primary={this.props.rowNumber % 2 === 0}
                    />
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
