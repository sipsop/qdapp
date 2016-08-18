import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native'

import { LargeButton } from './Button.js'


export class OkCancelModal extends Component {
    /* properties:
        visible: bool
        cancelModal: () => void
        okModal: [int] => void
        children: [Component]
        showOkButton: bool
    */

    render = () => {
        const cancelButton = <LargeButton
            label="Cancel"
            onPress={this.props.cancelModal}
            primary={false}
            style={{flex: 1, margin: 5, height: 60 }}
            />
        var okButton = undefined
        if (this.props.showOkButton) {
            okButton = <LargeButton
                label="Ok"
                onPress={this.props.okModal}
                style={{flex: 1, margin: 5}}
                />
        }

        return <Modal visible={this.props.visible}
                      onRequestClose={this.props.cancelModal}>
            <View style={{flex: 1, alignItems: 'stretch'}}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', marginBottom: 20, backgroundColor: "#fff"}}>
                    {this.props.children}
                </View>
                <View style={
                        { flexDirection: 'row'
                        , justifyContent: 'space-around'
                        , marginBottom: 20
                        }
                }>
                    {cancelButton}
                    {okButton}
                </View>
            </View>
        </Modal>
    }
}
