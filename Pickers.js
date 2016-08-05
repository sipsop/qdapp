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
import PickerAndroid from 'react-native-picker-android';
// import merge from 'merge'
import _ from 'lodash'

import { OkCancelModal } from './Modals.js'


export const Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid


export class PickerItem {
    /* Attributes:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        modalLabels: [str]
            list of labels displayed in the modal picker
    */

    constructor(title, labels, modalLabels) {
        this.title = title
        this.labels = labels
        this.modalLabels = modalLabels
    }
}

export class PickerCollection extends Component {
    /* properties:
        pickerItems: [PickerItem]
        handleItemChanges: [int => void]
        initialSelection: [int]
        wheelPicker: bool
    */

    constructor(props) {
        super(props)
        this.state = {
            modalVisible:     false,
        }
    }

    showModal = () => {
        this.setState({modalVisible: true})
    }

    closeModal = () => {
        this.setState({
            modalVisible: false,
        })
    }

    okModal = () => {
        this.props.handleItemChanges.forEach((f, i) => {
            f(this.state.currentSelection[i])
        })
        this.closeModal()
    }

    handleItemChange = (i, itemIndex) => {
        this.props.handleItemChanges[i](itemIndex)
    }

    render = () => {
        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            <OkCancelModal
                visible={this.state.modalVisible}
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
        const itemIndex = this.initialSelection[i]
        const handleChange = (itemIndex) => this.handleItemChange(i, itemIndex)

        if (this.props.wheelPicker) {
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
        return <Picker.Item key={i} value={i} label={label} />
    }

    renderScrollPickerItem = (handleChange, label, i) => {
        return <TouchableOpacity
                    style={{flex: 1}}
                    key={i}
                    onPress={handleChange}
                    >
            <Text style={{flex: 1, fontSize: 25, textAlign: 'center'}}>{label}</Text>
        </TouchableOpacity>
    }

    renderLabels = () => {
        const currentSelection = this.state.currentSelection
        const labels = this.props.pickerItems.map((pickerItem, i) => {
            const itemIndex = currentSelection[i]
            return pickerItem.labels[itemIndex]
        })
        return _.join(labels, ' + ')
    }
}
