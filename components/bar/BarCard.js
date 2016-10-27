import {
    React,
    View,
    TouchableOpacity,
    PureComponent,
    StyleSheet
} from '~/components/Component.js'
import { action, computed } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import LinearGradient from 'react-native-linear-gradient'

import { LazyComponent } from '../LazyComponent.js'
import { SmallOkCancelModal } from '../Modals.js'
import { BackButton } from '../BackButton.js'
import { PhotoImage } from '../PhotoImage.js'
import { tabStore, mapStore, orderStore } from '~/model/store.js'
import { barStore, getBarOpenTime } from '~/model/barstore.js'

@observer
export class DiscoverBarCard extends PureComponent {
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

  styles = StyleSheet.create({
    view: {
      flex: 0,
      height: this.props.imageHeight,
      marginTop: 5,
      marginLeft: 5,
      marginRight: 5,
      borderRadius: this.props.borderRadius
    }
  })

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
    const useGenericPicture = !photos || !photos.length

        // log("RENDERING BAR CARD", this.props.bar.name)

    return (
      <View style={this.styles.view}>
            <ConfirmChangeBarModal
                ref={ref => this.modal = ref}
                onConfirm={this.setBar}
                />
            <BarCard
                {...this.props}
                photo={photos && photos.length && photos[0]}
                onPress={this.handleCardPress}
                showDistance={true}
                />
        </View>)
  }
}

@observer
class ConfirmChangeBarModal extends PureComponent {
    /* properties:
        onCOnfirm: () => void
    */
  modal = null

  show = () => this.modal.show()
  close = () => this.modal.close()

    @computed get currentBarName () {
      const currentBar = barStore.getBar()
      return currentBar ? currentBar.name : ''
    }

  render = () => {
    return <SmallOkCancelModal
        ref={ref => this.modal = ref}
                    message={`Do you want to erase your order (${orderStore.totalText}) at ${this.currentBarName}?`}
                    onConfirm={this.props.onConfirm}
                    />
  }
}

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
    return (<View style={{flex: 1}}>
            <TouchableOpacity
                onPress={this.props.onPress}
                style={{flex: 2, borderRadius: this.props.borderRadius}}
                    >
                <BarPhoto {...this.props} />
            </TouchableOpacity>
        </View>)
    }
}

@observer
export class PlaceInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */

  styles = StyleSheet.create({
    buttonStyle: {
      width: 50,
      height: 50,
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    },
    buttonItems: {
      margin: 5,
      alignItems: 'center'
    }
  })

  handlePress = () => {
    tabStore.setCurrentTab(0)
    mapStore.focusBar(this.props.bar, true, track = true)
        // mapStore.currentMarker = this.props.bar
        // TODO: Scroll to top
  }

  render = () => {
    return (
        <View>
            <TouchableOpacity onPress={this.handlePress} style={this.styles.buttonStyle}>
                <View style={this.styles.buttonItems}>
                    <Icon name="map-marker" size={30} color="rgb(181, 42, 11)" />
                    <T style={{color: '#fff', fontSize: 14}}>
                        MAP
                        {/* this.props.bar.address.city */}
                    </T>
                </View>
            </TouchableOpacity>
        </View>)
  }
}

@observer
export class TimeInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
  render = () => {
    const openingTime = getBarOpenTime(this.props.bar)
    return (
      <View style={{flexDirection: 'row', alignItems: 'flex-end', marginRight: 10}}>
            <Icon name="clock-o" size={15} color='#fff' />
            <View style={{marginLeft: 5, flexDirection: 'row'}}>
                {
                    openingTime
                        ? this.renderOpeningTime(openingTime)
                        : this.renderUnknownOpeningTime()
                }
            </View>
        </View>)
  }

  renderOpeningTime = (openingTime : OpeningTime) => {
    return <OpeningTimeView
                    openingTime={openingTime}
                    textStyle={timeTextStyle} />
  }

  renderUnknownOpeningTime = () => {
    let text
    if (this.props.bar.openNow != null) {
      if (this.props.bar.openNow) {
        text = 'open'
      } else {
        text = 'closed'
      }
    } else {
      text = 'unknown'
    }

    return <T style={timeTextStyle}>{text}</T>
  }
}

@observer
export class OpeningTimeView extends PureComponent {
    /* properties:
        openingTime: OpeningTime
        textStyle: style object
    */

  styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  })

  render = () => {
    const textStyle = this.props.textStyle
    const openingTime = this.props.openingTime
    if (!openingTime) {
      return <T style={textStyle}>Unknown</T>
    }
    return (
        <View style={this.styles.row}>
            <Time style={textStyle} time={openingTime.open} />
            <T style={textStyle}> - </T>
            <Time style={textStyle} time={openingTime.close} />
        </View>)
  }
}
