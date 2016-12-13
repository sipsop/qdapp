import { React, Component, View, TouchableOpacity, PureComponent, Dimensions, StyleSheet, T } from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '../Header.js'
import { TimeView } from '../TimeView'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { MessageView } from './MessageView'
import { messageStore } from '/model/messagestore'

const { width } = Dimensions.get('window')

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
    /* properties:
        getRows: () => Array<Message>
        insideScrollView: Bool
    */

    @computed get descriptor() {
        return new MessageListDescriptor(this.props.getRows)
    }

    render = () => {
        return (
            <View style={styles.view}>
                <SimpleListView
                    descriptor={this.descriptor}
                    insideScrollView={this.props.insideScrollView}
                    />
            </View>
        )
    }
}

class MessageListDescriptor extends Descriptor {
    constructor(getRows) {
        super()
        this.getRows = getRows
    }

    @computed get rows() : Array<Message> {
        return this.getRows()
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
            /* alignment is set to 'stretch', so reset it... */
            <MessageView
                useDismissButton={false}
                message={message}
                showTimeStamp={true}
                />
        )
    }

}

const messageListDescriptor = new MessageListDescriptor()
