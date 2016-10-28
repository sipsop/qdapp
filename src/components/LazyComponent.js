import { React, Component, View, TouchableOpacity, PureComponent, T } from '~/src/components/Component.js'
import { Loader } from './Page.js'
import * as _ from '~/src/utils/curry.js'

import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

const { log, assert } = _.utils('./LazyComponent.js')

@observer
export class LazyComponent extends PureComponent {
    /* properties:
        style: style object
        timeout: Int
    */
    // This doens't work:
    //    @observable loaded = false

    mounted = true

    constructor(props) {
        super(props)
        this.state = { loaded: false }
    }

    static defaultProps = {
        // Load immediately, but asynchronously
        timeout: 0,
    }

    componentWillMount = () => {
        setTimeout(() => {
            if (this.mounted)
                this.setState({loaded: true})
        }, this.props.timeout)
    }

    componentWillUnmount() {
        this.mounted = false
    }

    render = () => {
        const children = this.props.children
        if (this.state.loaded) {
            if (Array.isArray(children))
                return <View style={this.props.style}>{this.props.children}</View>
            return children
        }

        const style = this.props.style || {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }
        return <View style={style}>
            <Loader />
        </View>
    }
}

export const lazyWrap = (lazy : bool, component : Component) : Component => {
    if (lazy)
        return <LazyComponent>{component}</LazyComponent>
    return component
}
