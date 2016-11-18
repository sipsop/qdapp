import { React, Component, View, TouchableOpacity, PureComponent, StyleSheet, Text, T } from '/components/Component'
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
        padding: 5,
    },
    titleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        // textDecorationLine: 'underline',
    },
    messageText: {
        flex: 1,
        // justifyContent: 'center',
        // textAlign: 'center',
        color: '#fff',
        fontSize: 15,
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

        var numberOfLines = this.props.numberOfLines
        if (message.title != null && numberOfLines) {
            numberOfLines -= 1
        }

        return (
            <View style={[styles.messageBubble, this.props.style]}>
                <View style={styles.messageContents}>
                    {message.title &&
                        <Text style={styles.titleText}
                            numberOfLines={1}>
                            {message.title}
                        </Text>
                    }
                    <T style={styles.messageText}
                        numberOfLines={numberOfLines}>
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
