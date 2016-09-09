import { React, Component, View, Modal, PureComponent, T } from './Component.js'
import { LargeButton, PrimaryButton, SecondaryButton } from './Button.js'
import * as _ from './Curry.js'

import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

const log = _.logger('./Modals.js')

@observer
export class SmallOkCancelModal extends PureComponent {
    /* properties:
        message: String
        onConfirm: ?() => void
        onClose: () => void
        okLabel: String
        cancelLabel
    */

    @observable visible = false

    @action show = () => {
        this.visible = true
    }

    @action close = () => {
        this.visible = false
        if (this.props.onClose)
            this.props.onClose()
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

@observer
export class SimpleModal extends PureComponent {
    /*
        <SimpleModal ref={ref => this.modal = ref}>
            ...
        </SimpleModal>
        <Button onPress={() => this.modal.show()} ... />
            ^- NOTE: don't pass this.modal.show, as it won't be bound yet!
    */
    @observable visible = false

    show = () => this.visible = true
    close = () => {
        this.visible = false
        if (this.props.onClose)
            this.props.onClose()
    }

    render = () => {
        return <OkCancelModal
                    visible={this.visible}
                    cancelModal={this.close}
                    showOkButton={false}
                    cancelLabel="Close"
                    {...this.props}
                    />
    }
}

export class OkCancelModal extends PureComponent {
    /* properties:
        visible: bool
        cancelModal: () => void
        okModal: () => void
        children: [Component]
        showOkButton: bool
        showCancelButton: bool
        okLabel: String
            label to show on the Ok button
        cancelLabel
        okDisabled: bool
        cancelDisabled: bool
    */

    static defaultProps = {
        okLabel: 'Ok',
        cancelLabel: 'Cancel',
        showCancelButton: true,
        cancelDisabled: false,
        okDisabled: false,
    }

    render = () => {
        var cancelButton = undefined
        if (this.props.showCancelButton) {
            cancelButton = <LargeButton
                label={this.props.cancelLabel}
                onPress={this.props.cancelModal}
                primary={false}
                style={{flex: 1, margin: 5, height: 55}}
                disabled={this.props.cancelDisabled}
                />
        }

        var okButton = undefined
        if (this.props.showOkButton) {
            okButton = <LargeButton
                label={this.props.okLabel || 'Ok'}
                onPress={this.props.okModal}
                style={{flex: 1, margin: 5, height: 55}}
                disabled={this.props.okDisabled}
                />
        }

        return <Modal visible={this.props.visible}
                      onRequestClose={this.props.cancelModal}>
            <View style={{flex: 1, alignItems: 'stretch'}}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'stretch', backgroundColor: "#fff"}}>
                    {this.props.children}
                </View>
                <View style={
                        { flexDirection: 'row'
                        , justifyContent: 'space-around'
                        // , marginBottom: 5
                        }
                }>
                    {cancelButton}
                    {okButton}
                </View>
            </View>
        </Modal>
    }
}
