import {
    React,
    View,
    PureComponent,
    StyleSheet,
    T,
} from '~/src/components/Component'
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
        const textStyle = this.props.textStyle
        const openingTime = this.props.openingTime
        if (!openingTime) {
            return <T style={textStyle}>Unknown</T>
        }
        return (
            <View style={styles.row}>
                <Time style={textStyle} time={openingTime.open} />
                <T style={textStyle}> - </T>
                <Time style={textStyle} time={openingTime.close} />
            </View>
        )
    }
}
