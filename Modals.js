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
    */

    render = () => {
        const cancelButton = <ModalButton label="Cancel" onPress={this.props.cancelModal} />
        var okButton = undefined
        if (this.props.okModal !== undefined) {
            okButton = <ModalButton label="Ok" onPress={this.props.okModal} />
        }

        return <Modal visible={this.props.visible}
                      onRequestClose={this.props.cancelModal}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', marginBottom: 20, backgroundColor: "#fff"}}>
                <View style={{flex: 1}} />
                <View style={{flex: 2}}>
                    {this.props.children}
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
                        {cancelButton}
                        {okButton}
                    </View>
                </View>
                <View style={{flex: 1}} />
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
