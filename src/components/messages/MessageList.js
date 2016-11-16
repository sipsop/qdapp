import { React, Component, View, TouchableOpacity, PureComponent, StyleSheet, T } from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '../Header.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { MessageView } from './MessageView'
import { messageStore } from '/model/messagestore'

const styles = StyleSheet.create({
    view: {
        flex: 1,
        paddingBottom: 5,
    },
    header: {
        flex: 0,
        height: 55,
    },
})


@observer
export class MessageList extends SimpleListView {
    render = () => {
        return (
            <View style={styles.view}>
                <SimpleListView descriptor={messageListDescriptor} />
            </View>
        )
    }
}

class MessageListDescriptor extends Descriptor {
    @computed get rows() : Array<OrderResult> {
        return messageStore.last100Messages
    }

    rowHasChanged = (m1, m2) => {
        return m1.id !== m2.id
    }

    refresh = async () => {
        await this.runRefresh(async () => {
            await messageStore.refresh()
        })
    }

    renderHeader = () => {
        return (
            <View style={styles.header}>
                <TextHeader
                    label="Messages"
                    rowHeight={55}
                    />
            </View>
        )
    }

    renderRow = (message, i) => {
        return (
            <MessageView
                useDefaultButton={false}
                message={message}
                />
        )
    }

}

const messageListDescriptor = new MessageListDescriptor()
