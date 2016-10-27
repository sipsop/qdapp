import React, {
  View
} from 'react'
import { observer } from 'mobx-react/native'
import { PureComponent, T } from '~/components/Component'
import Time from './Time'

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

@observer
class OpeningTimeView extends PureComponent {
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
        </View>)
  }
}

export default OpeningTimeView
