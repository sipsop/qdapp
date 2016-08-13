import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
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

import { OkCancelModal } from './Modals.js'

// export const Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid


export class PickerItem {
    /* Attributes:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        modalLabels: [str]
            list of labels displayed in the modal picker
    */

    @observable title = null
    @observable labels = null
    @observable modalLabels = null
    @observable initial = null

    constructor(title, labels, modalLabels, initial) {
        this.title = title
        this.labels = labels
        this.modalLabels = modalLabels
        this.initial = initial
    }
}

@observer export class PickerCollection extends Component {
    /* properties:
        pickerItems: [PickerItem]
        handleItemChanges: [int => void]
        initialSelection: [int]
        wheelPicker: bool
    */
    constructor(props) {
        super(props)
        autorun(() => {
            this.currentSelection = this.pickerItems.map((pickerItem) => pickerItem.initial)
        })
    }

    @observable modalVisible = false
    @observable currentSelection = null

    showModal = () => {
        this.modalVisible = true
    }

    closeModal = () => {
        this.modalVisible = false
        this.currentSelection = null
    }

    okModal = () => {
        this.props.handleItemChanges.forEach((f, i) => {
            f(this.selection[i])
        })
        this.closeModal()
    }

    @computed get selection() {
        if (this.currentSelection === null) {
            return this.props.initialSelection
        }
        return this.currentSelection
    }

    handleItemChange = (i, itemIndex) => {
        if (this.currentSelection === null) {
            this.currentSelection = this.props.initialSelection.slice()
        }
        this.currentSelection[i] = itemIndex
    }

    render = () => {
        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            <OkCancelModal
                visible={this.modalVisible}
                cancelModal={this.closeModal}
                okModal={this.okModal}
                showOkButton={this.props.wheelPicker}
                >
                {this.props.pickerItems.map(this.renderPicker)}
            </OkCancelModal>
            <TouchableOpacity onPress={this.showModal}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1}}>
                    <Text lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {this.renderLabels()}
                    </Text>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
        </View>
    }

    renderPicker = (pickerItem, i) => {
        const handleChange = (itemIndex) => this.handleItemChange(i, itemIndex)
        return <Text>Picker here</Text>

        if (this.props.wheelPicker) {
            const itemIndex = this.selection[i]
            return <Picker  key={i}
                            selectedValue={itemIndex}
                            onValueChange={this.handleChange}>
                {pickerItem.modalLabels.map(this.renderWheelPickerItem)}
            </Picker>
        } else {
            return  <ScrollView key={i}>
                <View style={{flex: 1, alignItems: 'center', margin: 25}}>
                    {pickerItem.modalLabels.map((label, i) => this.renderScrollPickerItem(handleChange, label, i))}
                </View>
            </ScrollView>
        }
    }

    renderWheelPickerItem = (label, i) => {
        return <Text>Picker here</Text>
        return <Picker.Item key={i} value={i} label={label} />
    }

    renderScrollPickerItem = (handleChange, label, i) => {
        return <TouchableOpacity
                    style={{flex: 1}}
                    key={i}
                    /*onPress={(itemIndex) => { handleChange(itemIndex); this.closeModal() }}*/
                    >
            <Text style={{flex: 1, fontSize: 25, textAlign: 'center'}}>{label}</Text>
        </TouchableOpacity>
    }

    renderLabels = () => {
        // const labels = this.props.pickerItems.map((pickerItem, i) => {
        //     const itemIndex = this.props.initialSelection[i]
        //     return pickerItem.labels[itemIndex]
        // })
        // return _.join(labels, ' + ')
        return "pint?"
    }
}
