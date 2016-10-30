import {
    React,
    Component,
    PureComponent,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    T,
} from '/components/Component.js'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

const { assert, log } = _.utils(__filename)

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
        textSize: 'small' | 'medium'
        numberOfLines: Int
            number of lines to clip message at
    */

    @observable visible = true

    static defaultProps = {
        closeable: true,
        dismissLabel: 'DISMISS',
        textSize: 'medium',
        dismissDirection: 'column',
    }

    styles = {
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

        const position = this.props.position
        const style = {
            flexDirection: this.props.dismissDirection,
            borderRadius: 10,
        }
        if (!style.margin)
            style.margin = 5
        if (!style.borderRadius)
            style.borderRadius = 10

        const styles = [this.styles.notification, this.props.style, style]

        const textSize = this.props.textSize
        const textStyles = [this.styles.textStyle[textSize]]
        if (this.props.dismissDirection === 'row') {
            // textStyles.push({numberOfLines: this.props.numberOfLines})
        }

        return <View style={styles}>
            <View style={{flex: 1}}>
                <T style={textStyles}>
                    {this.props.message}
                </T>
            </View>
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
