import {
    React,
    View,
    TouchableOpacity,
    PureComponent,
    StyleSheet
} from '~/components/Component'
import { action, computed } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { LazyComponent } from '../LazyComponent'
import { SmallOkCancelModal } from '../Modals'
import { BarPhoto } from './BarPhoto'
import { BackButton } from '../BackButton'
import { PhotoImage } from '../PhotoImage'
import { tabStore, mapStore, orderStore } from '~/model/store'
import { barStore, getBarOpenTime } from '~/model/barstore'

@observer
export class BarCard extends PureComponent {
    /* properties:
        bar: Bar
        borderRadius: Int
        imageHeight: Int
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
        footer: Component
            footer to show in the bar card
        onPress: () => void
        onBack: ?() => void
        showBackButton: Bool
    */

  static defaultProps = {
    imageHeight: 200,
    borderRadius: 5
  }

  render = () => {
    return (
      <View style={{flex: 1}}>
            <TouchableOpacity
                onPress={this.props.onPress}
                style={{flex: 2, borderRadius: this.props.borderRadius}}
                    >
                <BarPhoto {...this.props} />
            </TouchableOpacity>
        </View>)
  }
}
