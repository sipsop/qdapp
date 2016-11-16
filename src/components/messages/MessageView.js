import { React, Component, View, TouchableOpacity, PureComponent, StyleSheet, T } from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'
import { getTheme } from 'react-native-material-kit'

import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/messages/MessageView')

const styles = StyleSheet.create({
    view: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        // height: 55,
        margin: 5,
        marginBottom: 0,
        padding: 5,
        borderRadius: 10,
    },
    messageText: {
        flex: 1,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        margin: 5,
    },
    verticalBar: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        // height: 35,
        width: 1,
        margin: 5,
        marginTop: 10,
        marginBottom: 10,
    },
    button: {
        flexWrap: 'wrap',
        padding: 5,
    },
    buttonText: {
        fontSize: 17,
        color: config.theme.primary.medium,
    },
})

@observer
export class MessageView extends PureComponent {
    /* properties:
        message: Message
        useDefaultButton: Bool
        style: style obj
    */

    static defaultProps = {
        useDefaultButton: true,
    }

    @action showMessageList = () => {
        // TODO:
    }

    render = () => {
        const message = this.props.message

        const buttonLabel = message.buttonLabel || 'VIEW'
        const buttonPress = message.buttonPress || (
            this.props.useDefaultButton && this.showMessageList)

        return (
            <View style={[styles.view, this.props.style]}>
                <View style={{flex: 1}}>
                    <T style={styles.messageText} numberOfLines={2}>
                        {message.content}
                    </T>
                </View>
                {/*<View style={styles.verticalBar} />*/}
                {buttonPress &&
                    <TouchableOpacity onPress={buttonPress}>
                        <View style={styles.button}>
                            <T style={styles.buttonText}>
                                {buttonLabel}
                             </T>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}
