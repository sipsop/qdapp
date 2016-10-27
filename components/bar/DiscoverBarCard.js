import React, {
  View,
  StyleSheet
} from 'react'
import { PureComponent } from '~/components/Component.js'
import { action } from 'mobx'
import { observer } from 'mobx-react/native'
import { tabStore, orderStore } from '~/model/store.js'
import { barStore } from '~/model/barstore.js'

import ConfirmChangeBarModal from './ConfirmChangeBarModal'
import BarCard from './BarCard'

const styles = StyleSheet.create({
  view: {
    flex: 0,
    height: this.props.imageHeight,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: this.props.borderRadius
  }
})

@observer
class DiscoverBarCard extends PureComponent {
    /* properties:
        borderRadius: Int
        imageHeight: Int
        bar: Bar
            bar info
        onBack: ?() => void
        showBackButton: Bool
    */
  modal = null

  static defaultProps = {
    borderRadius: 5
  }

  handleCardPress = () => {
    if (orderStore.orderList.length > 0 && this.props.bar.id !== barStore.barID) {
      this.modal.show()
    } else {
      this.setBar()
    }
  }

    @action setBar = () => {
      barStore.setBarID(this.props.bar.id, track = true)
      tabStore.setCurrentTab(1)
      if (barStore.barScrollView) {
        barStore.barScrollView.scrollTo({x: 0, y: 0})
      }
    }

  render = () => {
    const photos = this.props.bar.photos

    return (
      <View style={styles.view}>
            <ConfirmChangeBarModal
                ref={ref => this.modal = ref}
                onConfirm={this.setBar}
                />
            <BarCard
                {...this.props}
                photo={photos && photos.length && photos[0]}
                onPress={this.handleCardPress}
                showDistance
                />
        </View>)
  }
}

export default DiscoverBarCard
