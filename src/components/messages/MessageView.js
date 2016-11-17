import { React, Component, View, TouchableOpacity, PureComponent, StyleSheet, T } from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TimeView } from '../TimeView'
import { formatTime } from '/utils/time'
import { modalStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { assert, log } = _.utils('/components/messages/MessageView')

const styles = StyleSheet.create({
    messageBubble: {
        flex: 0,
        // minWidth: 100,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        // height: 55,
        margin: 5,
        marginBottom: 0,
        padding: 5,
        borderRadius: 10,
    },
    messageContents: {
        flex: 1,
        flexWrap: 'wrap',
    },
    messageText: {
        flex: 1,
        // justifyContent: 'center',
        // textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        margin: 5,
    },
    time: {
        // flex: 1,
        alignItems: 'flex-end',
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
        numberOfLines: Int
        showTimeStamp: Bool
    */

    static defaultProps = {
        useDefaultButton: true,
        showTimeStamp: false,
    }

    render = () => {
        const message = this.props.message

        const buttonLabel = message.buttonLabel || 'VIEW'
        const buttonPress = message.buttonPress || (
            this.props.useDefaultButton && modalStore.openMessageListModal)

        return (
            <View style={[styles.messageBubble, this.props.style]}>
                <View style={styles.messageContents}>
                    <T style={styles.messageText}
                        numberOfLines={this.props.numberOfLines}>
                        {message.content}
                    </T>
                    {this.props.showTimeStamp &&
                        <View style={styles.time}>
                            <TimeView
                                color='rgb(193, 193, 193)'
                                time={formatTime(message.timestamp)}
                                />
                        </View>
                    }
                </View>
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
