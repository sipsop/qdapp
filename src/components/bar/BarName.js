import { React, Component, PureComponent, T } from '~/src/components/Component'
import { observer } from 'mobx-react/native'
import { config } from '~/src/utils/config.js'

@observer
export class BarName extends PureComponent {
    /* properties:
        barName: String
    */
  render = () => {
    return (
        <T style={{ fontSize: 22,
                     color: config.theme.primary.light
                    // , color: config.theme.primary.medium
                    // , color: '#fff'
                    // , color: '#000'
                    }}
                    ellipsizeMode='clip'
                    numberOfLines={2}
                    >
            {this.props.barName}
        </T>)
  }
}
