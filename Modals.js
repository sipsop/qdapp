import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native'

export class OkCancelModal extends Component {
    /* properties:
        visible: bool
        cancelModal: () => void
        okModal: [int] => void
        children: [Component]
        showOkButton: bool
    */

    render = () => {
        const cancelButton = <ModalButton label="Cancel" onPress={this.props.cancelModal} />
        var okButton = undefined
        if (this.props.showOkButton) {
            okButton = <ModalButton label="Ok" onPress={this.props.okModal} />
        }

        return <Modal visible={this.props.visible}
                      onRequestClose={this.props.cancelModal}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', marginBottom: 20, backgroundColor: "#fff"}}>
                <View>
                    {this.props.children}
                </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {cancelButton}
                {okButton}
            </View>
        </Modal>
    }
}

class ModalButton extends Component {
    /* properties:
        label: str
        onPress: () => void
    */
    render = () => {
        return <TouchableOpacity style={{}} onPress={this.props.onPress}>
            <Text style={{fontSize: 30, textAlign: 'center', textDecorationLine: 'underline'}}>
                {this.props.label}
            </Text>
        </TouchableOpacity>
    }
}
