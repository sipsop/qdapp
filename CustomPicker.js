import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome'
import { Picker } from './WheelPicker.js'

export class PickerModal extends Component {
    /* properties:

    */

    render = () => {
        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            <Modal  animationType={"none"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={this.closeModal}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', marginBottom: 20, backgroundColor: "#fff"}}>
                    <View style={{flex: 1}} />
                    <View style={{flex: 2}}>
                        {this.props.children}
                        <TouchableOpacity style={{}} onPress={this.closeModal}>
                            <Text style={{fontSize: 30, textAlign: 'center', textDecorationLine: 'underline'}}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}} />
                </View>
            </Modal>
            <TouchableOpacity onPress={this.showModal}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1}}>
                    <Text lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {label}
                    </Text>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
    }
}

export class CustomPicker extends Component {
    /* properties:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        modalLabels: [str]
            list of labels displayed in the modal picker
        current: int
            index of initial value to display
        handleItemChange: int -> void
    */
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
        }
    }

    showModal = () => {
        this.setState({modalVisible: true})
    }

    closeModal = () => {
        this.setState({modalVisible: false})
    }

    chooseItem = (i) => {
        this.closeModal()
        this.props.handleItemChange(i)
    }

    render = () => {
        const label = this.props.labels[this.props.current || 0]

        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            <Modal  animationType={"fade"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={this.closeModal}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', marginBottom: 20, backgroundColor: "#fff"}}>
                    <View style={{flex: 1}} />
                    <View style={{flex: 2}}>
                        {this.props.children}
                        <TouchableOpacity style={{}} onPress={this.closeModal}>
                            <Text style={{fontSize: 30, textAlign: 'center', textDecorationLine: 'underline'}}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1}} />
                </View>
            </Modal>
            <TouchableOpacity onPress={this.showModal}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1}}>
                    <Text lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {label}
                    </Text>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
        </View>
    }

    renderPicker = () => {
        if (this.props.scroll) {
            return <ScrollView>
                <View style={{flex: 1, alignItems: 'center', margin: 25}}>
                    {this.props.modalLabels.map(this.renderModalScrollItem)}
                </View>
            </ScrollView>
        } else {
            return <Picker selectedValue={this.props.current} onValueChange={this.handleItemChange}>
                {this.props.modalLabels.map(this.renderModalWheelItem)}
            </Picker>
        }
    }

    renderModalWheelItem = (label, i) => {
        return <Picker.Item key={i} value={i} label={label} />
    }

    renderModalScrollItem = (label, i) => {
        return <TouchableOpacity style={{flex: 1}} key={i} onPress={() => this.chooseItem(i)}>
            <Text style={{flex: 1, fontSize: 25, textAlign: 'center'}}>{label}</Text>
        </TouchableOpacity>
    }

    }
}
