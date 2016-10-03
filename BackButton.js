import {
    React,
    Component,
    View,
    TouchableOpacity,
    MaterialIcon,
    PureComponent,
} from './Component.js'
import { observer } from 'mobx-react/native'

import * as _ from './Curry.js'
const { log, assert } = _.utils('./BackButton.js')


@observer
export class BackButton extends PureComponent {
    /* properties:
        enabled: Bool
        onBack: ?() => void
    */
    render = () => {
        if (!this.props.enabled)
            <View />

        return <TouchableOpacity onPress={this.props.onBack}>
            <View style={
                    { width: 55
                    , height: 55
                    , justifyContent: 'center'
                    , alignItems: 'center'
                    , backgroundColor: 'rgba(0,0,0,0)'
                    }
                }>
                <MaterialIcon name="arrow-back" size={30} color='#fff' />
            </View>
          </TouchableOpacity>
    }
}
