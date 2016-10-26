import {
    React,
    Component,
    PureComponent,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    T,
} from './Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

const { assert, log } = _.utils('./Notification.js')

export type Position =
    | 'TopLeft'
    | 'TopRight'
    | 'TopCenter'
    | 'Center'
    | 'BottomLeft'
    | 'BottomRight'
    | 'BottomCenter'

const { width, height } = Dimensions.get('window')

@observer
export class Notification extends PureComponent {
    /* properties:
        position: Position
        dismissDirection: 'row' | 'column'
        message: String
        closeable: bool
        dismissLabel: String
        onDismiss: () => void
        style: {
            width: Int,
            height: Int,
            borderRadius : Int,
            margin: Int,
            ...
        }
        absolutePosition: Bool
            absolute positioning for notification?
        textSize: 'small' | 'medium'
        numberOfLines: Int
            number of lines to clip message at
    */

    @observable visible = true

    static defaultProps = {
        closeable: true,
        dismissLabel: 'DISMISS',
        absolutePosition: true,
        textSize: 'medium',
        dismissDirection: 'column',
    }

    styles = {
        TopLeft: {
            top: 5,
            left: 5,
        },
        TopRight: {
            top: 5,
            right: 5,
        },
        TopCenter: {
            top: 5,
            // left set in render() method
        },
        Center: {
            // left and top set in render()
        },
        BottomLeft: {
            bottom: 5,
            left: 5,
        },
        BottomRight: {
            bottom: 5,
            right: 5,
        },
        BottomCenter: {
            // bottom and left set in render()
        },
        notification: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 5,
        },
        textStyle: {
            small: {
                color: '#fff',
                fontSize: 15,
                textAlign: 'center',
            },
            medium: {
                color: '#fff',
                fontSize: 20,
                textAlign: 'center',
            },
        },
        dismiss: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
        },
        dismissText: {
            small: {
                fontSize: 17,
                color: config.theme.primary.medium,
            },
            medium: {
                fontSize: 22,
                color: config.theme.primary.medium,
            },
        },
    }

    show = () => this.visible = true
    close = () => this.visible = false

    render = () => {
        if (!this.visible || this.props.visible === false)
            return null

        const absolute = this.props.absolutePosition
        const position = this.props.position
        const style = {
            ...absolute && this.styles[position] || undefined,
            ...this.styles.notification,
            ...this.props.style,
            flexDirection: this.props.dismissDirection,
        }

        if (absolute) {
            style.position = 'absolute'
            if (!style.width && !style.minWidth)
                style.width = width - 10
            if (!style.height && !style.minHeight)
                style.height = height - 10

            if (position.includes('Center')) {
                style.left = _.max(0, (width - style.width) / 2)
                if (position === 'Center')
                    style.top = _.max(0, (height - style.height) / 2)
            }
        } else if (!style.margin) {
            style.margin = 5
        }

        if (!style.borderRadius)
            style.borderRadius = 10

        const textSize = this.props.textSize
        const textStyle = this.styles.textStyle[textSize]
        if (this.props.dismissDirection === 'row') {
            textStyle.numberOfLines = this.props.numberOfLines
        }

        return <View style={style}>
            <T style={textStyle}>
                {this.props.message}
            </T>
            { this.props.closeable &&
                <TouchableOpacity onPress={this.props.onPress || this.close}>
                    <View style={this.styles.dismiss}>
                        <T style={this.styles.dismissText[textSize]}>
                            {this.props.dismissLabel}
                        </T>
                    </View>
                </TouchableOpacity>
            }
        </View>
    }
}

/* Show error notifications */
// export class DownloadErrorNotification extends DownloadResultView {
//     renderError = () => <Notification {...this.props} />
//     renderInProgress = () => null
//     renderFinished = () => null
// }
