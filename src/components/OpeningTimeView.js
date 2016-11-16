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
        alignItems: 'center',
    },
})

@observer
export class OpeningTimeView extends PureComponent {
    /* properties:
        openingTime: OpeningTime
        timeTextStyle: text style
    */
    render = () => {
        const openingTime = this.props.openingTime
        if (!openingTime) {
            return <T>Unknown</T>
        }
        return (
            <View style={styles.row}>
                <Time style={this.props.timeTextStyle} time={openingTime.open} />
                <T style={this.props.timeTextStyle}> - </T>
                <Time style={this.props.timeTextStyle} time={openingTime.close} />
            </View>
        )
    }
}
