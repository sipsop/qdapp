import {
    React,
    PureComponent,
    Dimensions,
} from '~/src/components/Component'

/* Class to track the size of a view:

    class MyComponent extends SizeTracker {

        render = () => {
            const width = this.state.width
            const height = this.state.height
            return <View onLayout={this.handleLayoutChange}>
                ... use width and height ...
            </View>
        }
    }
*/
export class SizeTracker extends Component {

    constructor(props) {
        super(props)
        const { height, width} = Dimensions.get('screen')
        // approximate width and height
        this.state = {width: width, height: height}
    }

    handleLayoutChange = (event) => {
        const { height, width} = event.nativeEvent.layout
        this.setState({width: width, height: height})
    }

}
