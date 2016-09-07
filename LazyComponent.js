import { React, Component, View, TouchableOpacity, PureComponent, T } from './Component.js'
import { Loader } from './Page.js'
import * as _ from './Curry.js'

import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

const { log, assert } = _.utils('./LazyComponent.js')

@observer
export class LazyComponent extends PureComponent {
    /* properties:
        style: style object
        timeout: Int
    */
    // @observable loaded = false

    constructor(props) {
        super(props)
        this.state = { loaded: false }
    }

    static defaultProps = {
        // Load immediately, but asynchronously
        timeout: 0,
    }

    componentWillMount = () => {
        setTimeout(() => this.setState({loaded: true}), this.props.timeout)
    }

    render = () => {
        return <View style={this.props.style}>
            {
                this.state.loaded
                    ? this.props.children
                    : <Loader />
            }
        </View>
    }
}
