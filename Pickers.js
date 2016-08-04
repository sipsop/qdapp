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
import merge from 'merge'

import { OkCancelModal } from './Modals.js'


export const Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid


export class PickerItem {
    /* Attributes:
        name: str
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

class BasicPickerCollection extends Component {
    /* properties:
        pickerItems: [PickerItem]
        handleItemsChange: [int] -> void
        initialSelection: { name: int }
        wheelPicker: bool
    */
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            currentSelection: merge(true, props.initialSelection),
        }
    }

    showModal = () => {
        this.setState({modalVisible: true})
    }

    closeModal = () => {
        this.setState({
            modalVisible: false,
            currentSelection: this.props.initialSelection,
        })
    }

    okModal = (itemIndices) => {
        this.closeModal()
        this.props.handleItemsChange(itemIndices)
    }

    getItemIndex = (name) => {
        this.state.currentSelection[name]
    }

    setItemIndex = (name, itemIndex) => {
        this.state.currentSelection[name] = itemIndex
    }

    render = () => {
        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            <OkCancelModal
                visible={this.state.modalVisible}
                cancelModal={this.closeModal}
                okModal={this.okModal}
                showOkButton={this.wheelPicker}
                >
                {this.pickerItems.map(this.renderPicker)}
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
        if (this.wheelPicker) {
            return <WheelPicker key={i} pickerItem={pickerItem} />
        } else {
            return <ScrollPicker key={i} pickerItem={pickerItem} />
        }
    }

    renderLabels = () => {
        const currentSelection = this.state.currentSelection
        const labels = this.props.pickerItems.map((pickerItem) => {
            const itemIndex = currentSelection[pickerItem.name]
            return pickerItem.labels[itemIndex]
        })
        return _.join(labels, ' + ')
    }
}

export class WheelPicker extends Component {
    /* properties:
        pickerItem: PickerItem
    */
    render = () => {
        const itemIndex = this.getItemIndex(this.props.pickerItem.name)
        return <Picker selectedValue={itemIndex} onValueChange={this.setItemIndex}>
            {this.props.modalLabels.map(this.renderItem)}
        </Picker>
    }

    renderItem = (label, i) => {
        return <Picker.Item key={i} value={i} label={label} />
    }

}

export class ScrollPicker extends Component {
    /* properties:
        pickerItem: PickerItem
    */

    render = () => {
        return <ScrollView>
            <View style={{flex: 1, alignItems: 'center', margin: 25}}>
                {this.props.modalLabels.map(this.renderItem}
            </View>
        </ScrollView>
    }

    renderItem = (label, i) => {
        return <TouchableOpacity
                    style={{flex: 1}}
                    key={i}
                    onPress={(itemIndex) => this.setItemIndex(this.props.pickerItem.name, itemIndex)}
                    >
            <Text style={{flex: 1, fontSize: 25, textAlign: 'center'}}>{label}</Text>
        </TouchableOpacity>
    }
}
