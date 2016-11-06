import {
    React,
    View,
    PureComponent,
    StyleSheet,
    T,
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { Time } from './Time'

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

@observer
export class OpeningTimeView extends PureComponent {
    /* properties:
        openingTime: OpeningTime
        textStyle: style object
    */

    render = () => {
        return (
          <View />
        )
    }
}
