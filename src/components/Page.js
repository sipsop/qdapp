import {
    React,
    PureComponent,
    View
 } from '/components/Component'
import { ActivityIndicator } from 'react-native'

import { LazyComponent } from './LazyComponent'
import { config } from '/utils/config'

// export class Page extends PureComponent {
//     constructor(props) {
//         super(props)
//         this.state = { renderPlaceholderOnly: true }
//     }
//
//     componentDidMount = () => {
//         InteractionManager.runAfterInteractions(() => {
//             this.setState({renderPlaceholderOnly: false})
//         })
//     }
//
//     render = () => {
//         if (this.state.renderPlaceholderOnly) {
//             return <Loader />
//         }
//         return this.renderView()
//     }
//
//     renderView = () => {
//         throw Error("renderView must be implmented!")
//     }
// }


export class Page extends PureComponent {
    render = () => {
        return <LazyComponent>
            {this.renderView()}
        </LazyComponent>
    }

    renderView = () => {
        throw Error("renderView must be implmented!")
    }
}

export class Loader extends PureComponent {
    /* properties:
        style: style object
        color: ?String
    */
    styles = {
        view: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }

    render = () => {
        return <View style={[this.styles.view, this.props.style]}>
            <ActivityIndicator
                animating={true}
                color={this.props.color || config.theme.primary.dark}
                size="large"
                />
        </View>
    }
}
