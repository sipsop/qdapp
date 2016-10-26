import {
    React,
    Component,
    View,
    TouchableOpacity,
    MaterialIcon,
    PureComponent,
} from '~/components/Component.js'
import { observer } from 'mobx-react/native'

import * as _ from '~/utils/curry.js'
const { log, assert } = _.utils('./BackButton.js')


@observer
export class BackButton extends PureComponent {
    /* properties:
        enabled: Bool
        onBack: ?() => void
        style: style object
        buttonStyle: style object
    */
    static defaultProps = {
        color: '#fff',
        iconSize: 30,
    }

    render = () => {
        if (!this.props.enabled)
            return <View />

        return <TouchableOpacity
                    onPress={this.props.onBack}
                    style={this.props.style}
                    >
            <View style={
                    { width: 55
                    , height: 55
                    , justifyContent: 'center'
                    , alignItems: 'center'
                    , backgroundColor: 'rgba(0,0,0,0)'
                    , ...this.props.buttonStyle
                    }
                }>
                <MaterialIcon
                    name="arrow-back"
                    size={this.props.iconSize}
                    color={this.props.color}
                    />
            </View>
          </TouchableOpacity>
    }
}
