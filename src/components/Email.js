import {
    React,
    View,
    PureComponent,
    StyleSheet,
    TouchableOpacity,
    T,
} from '/components/Component'
import { observable, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'
import { email } from 'react-native-communications'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/Email')

@observer
export class Email extends PureComponent {
    /* properties:
        email: String
        subject: ?String
        body: ?String
        style: style object
        childen: ?[Component]
    */

    static defaultProps = {
        subject: null,
        body: null,
    }

    sendEmail = () => {
        email(
            [this.props.email],
            null,                  /* cc */
            null,                  /* bcc */
            this.props.subject,    /* subject */
            this.props.body,       /* body */
        )
    }

    render = () => {
        return (
            <TouchableOpacity onPress={this.sendEmail}>
                {this.props.children ||
                    <T style={this.props.style}>
                        {this.props.email}
                    </T>
                }
            </TouchableOpacity>
        )
    }
}

const sendEmail = () => {

}
