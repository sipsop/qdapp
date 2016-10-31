import { React, Component, View, Modal, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { LargeButton, PrimaryButton, SecondaryButton } from './Button.js'
import { TextHeader } from './Header.js'
import { MarkdownLoader } from './markdown/MarkdownLoader'
import * as _ from '/utils/curry.js'

import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

const log = _.logger('./Modals.js')

@observer
export class Message extends PureComponent {
    modal = null

    show = () => this.modal.show()
    close = () => this.modal.close()

    render = () => {
        return <SmallOkCancelModal
                    ref={ref => this.modal = ref}
                    showOkButton={false}
                    showCancelButton={false}
                    closeOnTouch={true}
                    {...this.props} />
    }
}

@observer
export class SmallOkCancelModal extends PureComponent {
    /* properties:
        message: String
        onConfirm: ?() => void
        onClose: () => void
        okLabel: String
        cancelLabel
        showOkButton: bool
        showCancelButton: bool
        closeOnTouch: bool
    */

    @observable visible = false

    static defaultProps = {
        showOkButton:       true,
        showCancelButton:   true,
        closeOnTouch:       false,
    }

    @action show = () => {
        this.visible = true
    }

    @action close = () => {
        this.visible = false
        if (this.props.onClose)
            this.props.onClose()
    }

    @action confirm = () => {
        if (this.props.onConfirm)
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


        let content = <View
                style={
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
                {
                    this.props.message
                        ? <T style={textStyle}>{this.props.message}</T>
                        : this.props.children
                }
                <View style={
                        { flexDirection: 'row'
                        , justifyContent: 'flex-end'
                        }
                    }>
                    {
                        this.props.showCancelButton
                            ? <SecondaryButton
                                label={this.props.cancelLabel || 'Cancel'}
                                onPress={this.close}
                                {...buttonProps}
                                />
                            : undefined
                    }
                    {
                        this.props.showOkButton
                            ? <PrimaryButton
                                label={this.props.okLabel || 'Ok'}
                                onPress={this.confirm}
                                {...buttonProps}
                                />
                            : undefined
                    }
                </View>
            </View>
        </View>

        if (this.props.closeOnTouch) {
            content = <TouchableOpacity
                            onPress={this.close}
                            style={{flex: 1}}
                            >
                {content}
            </TouchableOpacity>
        }

        return  <Modal
                visible={this.visible}
                onRequestClose={this.close}
                transparent={true}
                >
            {content}
        </Modal>
    }
}

@observer
export class MarkdownModal extends PureComponent {
    /* properties:
        header: String
        url: String
    */
    modal = null
    show = () => this.modal.show()
    render = () => {
        return <SimpleModal ref={ref => this.modal = ref}>
            <View style={{flex: 1}}>
                <TextHeader
                    label={this.props.header}
                    rowHeight={55}
                    />
                <MarkdownLoader
                    name={this.props.header}
                    url={this.props.url}
                    />
            </View>
        </SimpleModal>
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
        return (<OkCancelModal
                    visible={this.visible}
                    cancelModal={this.close}
                    showOkButton={false}
                    cancelLabel="Close"
                    {...this.props}
                    />)
    }
}

@observer
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
        cancelLabel: String
        okDisabled: bool
        cancelDisabled: bool
        okBackgroundColor: String
        okBorderColor: String
        okDisabledColor: String
        cancelBackgroundColor: String
        cancelBorderColor: String
        cancelDisabledColor: String
        disabledColor: String
    */

    static defaultProps = {
        okLabel: 'Ok',
        cancelLabel: 'Cancel',
        showCancelButton: true,
        cancelDisabled: false,
        okDisabled: false,
    }

    render = () => {
        let cancelButton = undefined
        if (this.props.showCancelButton) {
            cancelButton = <LargeButton
                label={this.props.cancelLabel}
                onPress={this.props.cancelModal}
                primary={false}
                style={{flex: 1, margin: 5, height: 55}}
                disabled={this.props.cancelDisabled}
                disabledColor={this.props.cancelDisabledColor || this.props.disabledColor}
                backgroundColor={this.props.cancelBackgroundColor}
                borderColor={this.props.cancelBorderColor} />
        }

        let okButton = undefined
        if (this.props.showOkButton) {
            okButton = <LargeButton
                label={this.props.okLabel || 'Ok'}
                onPress={this.props.okModal}
                style={{flex: 1, margin: 5, height: 55}}
                disabled={this.props.okDisabled}
                disabledColor={this.props.okDisabledColor || this.props.disabledColor}
                backgroundColor={this.props.okBackgroundColor}
                borderColor={this.props.okBorderColor} />
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
