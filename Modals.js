import { React, Component, View, Modal, PureComponent, T } from './Component.js'
import { LargeButton, PrimaryButton, SecondaryButton } from './Button.js'

import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'


@observer
export class SmallOkCancelModal extends PureComponent {
    /* properties:
        message: String
        onConfirm: ?() => void
        okLabel: String
        cancelLabel
    */

    @observable visible = false

    @action show = () => {
        this.visible = true
    }

    @action close = () => {
        this.visible = false
    }

    @action confirm = () => {
        this.props.onConfirm()
        this.close()
    }

    render = () => {
        const textStyle = {
            color: 'black',
            fontSize: 20,
        }
        const buttonProps = {
            fontSize: 25,
            style: {
                marginLeft: 10,
                marginRight: 10,
                height: 55,
            }
        }

        return <Modal
                visible={this.visible}
                onRequestClose={this.close}
                transparent={true}
                >
            <View style={
                    { flex: 1
                    , justifyContent: 'center'
                    , backgroundColor: 'rgba(0, 0, 0, 0.6)'
                    }
                }>
                <View style={
                        { backgroundColor: '#fff'
                        , margin: 20
                        , padding: 10
                        , borderRadius: 20
                        }
                    }>
                    <T style={textStyle}>{this.props.message}</T>
                    <View style={
                            { flexDirection: 'row'
                            , justifyContent: 'flex-end'
                            }
                        }>
                        <SecondaryButton
                            label={this.props.cancelLabel || 'Cancel'}
                            onPress={this.close}
                            {...buttonProps}
                            />
                        <PrimaryButton
                            label={this.props.okLabel || 'Ok'}
                            onPress={this.confirm}
                            {...buttonProps}
                            />
                    </View>
                </View>
            </View>
        </Modal>
    }
}

export class OkCancelModal extends PureComponent {
    /* properties:
        visible: bool
        cancelModal: () => void
        okModal: () => void
        children: [Component]
        showOkButton: bool
        okLabel: String
            label to show on the Ok button
        cancelLabel
    */

    render = () => {
        const cancelButton = <LargeButton
            label={this.props.cancelLabel || 'Cancel'}
            onPress={this.props.cancelModal}
            primary={false}
            style={{flex: 1, margin: 5, height: 55 }}
            />
        var okButton = undefined
        if (this.props.showOkButton) {
            okButton = <LargeButton
                label={this.props.okLabel || 'Ok'}
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
                        , marginBottom: 10
                        }
                }>
                    {cancelButton}
                    {okButton}
                </View>
            </View>
        </Modal>
    }
}
