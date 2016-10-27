import { React, PureComponent, T } from '~/components/Component'
import { observer } from 'mobx-react/native'

@observer
export class Time extends PureComponent {
    /* properties:
        time: Time
        style: text style
    */
  render = () => {
    const time = this.props.time
    let minute = '' + time.minute
    if (minute.length === 1) {
      minute = '0' + minute
    }
    return (
        <T style={this.props.style}>
            {time.hour}.{minute}
        </T>
    )
  }
}
