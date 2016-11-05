import { React, Component, View, Modal, TouchableOpacity, PureComponent, StyleSheet, T } from '/components/Component.js'
import { observer } from 'mobx-react/native'
import Markdown from 'react-native-simple-markdown'

import { DownloadComponent } from '../download/DownloadComponent'
import { MarkdownDownload } from '/network/markdown'

const styles = StyleSheet.create({
    view: {
        padding: 5,
    },
    plainText: {
        color: '#000',
        fontSize: 18,
    }
})

export class MarkdownLoader extends DownloadComponent {
    /* properties:
        name: String
        url: String
    */

    get errorMessage() {
        return `Error downloading ${this.props.name}`
    }

    getDownload = () => {
        return new MarkdownDownload(() => {
            return {
                url: this.props.url,
            }
        })
    }

    renderFinished = (body) => {
        return (
            <Markdown styles={styles}>
                {body}
            </Markdown>
        )
    }
}
