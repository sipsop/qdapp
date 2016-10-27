import React, {
  View
} from 'react'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { PureComponent, T } from '~/components/Component'

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 5,
    backgroundColor: 'rgba(0,0,0,0)' /* iOS */
  },
  text: {
    fontSize: 15, color: '#fff'
  }
}

@observer
export class BarCardHeader extends PureComponent {
    /* properties:
        style: style object
        pictureIsGeneric: Bool
    */
  renderGenericPictureHeader = () => {
      return (<LinearGradient
          style={this.props.style}
          colors={['rgba(0, 0, 0, 1.0)', 'rgba(0, 0, 0, 0.0)']}
                      >
              <View style={styles.container}>
                  <T style={styles.text}>
                      (No picture available)
                  </T>
              </View>
          </LinearGradient>)
  }

  render = () => {
    if (this.props.pictureIsGeneric) {
      return this.renderGenericPictureHeader()
    }
    return <View style={this.props.style} />
  }

}
