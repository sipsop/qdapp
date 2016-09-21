import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Slider from 'react-native-slider'

import { LargeButton } from '../Button.js'
import { LazyBarHeader, LazyBarPhoto } from '../Bar/BarPage.js'
import { SimpleListView } from '../SimpleListView.js'
import { OkCancelModal, SmallOkCancelModal } from '../Modals.js'
import { config } from '../Config.js'
import { Selector, SelectorItem } from '../Selector.js'
import { Header, HeaderText, TextHeader } from '../Header.js'
import { barStore, orderStore } from '../Store.js'
import * as _ from '../Curry.js'

import { CardInput, makeAddCardButton } from './CardInput.js'
import { paymentStore } from './PaymentStore.js'
import { getCreditCardIcon } from './CreditCardInfo.js'
import { PaymentConfigModal } from '../ControlPanel.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Payment/PaymentModal.js')



class TipStore {
    @observable tipPercentage = orderStore.tipFactor * 100

    @action setTipPercentage = (percentage) => {
        this.tipPercentage = percentage
    }
}

const tipStore = new TipStore()

autorun(() => {
    tipStore.tipPercentage = orderStore.tipFactor * 100
})

@observer
class TipComponent extends PureComponent {
    styles = {
        tipView: {
            alignItems: 'center',
        },
        tipSliderView: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 55,
        },
        tipSlider: {
            flex: 1,
            marginLeft: 10,
            marginRight: 10,
        },
        percentageText: {
            minWidth: 60,
            fontSize: 20,
            color: '#000',
            textAlign: 'right',
            marginRight: 10,
        },

        tipRoundButtonView: {
            alignItems: 'center',
        },
    }

    @action handleTipChange = (percentage) => {
        orderStore.setTipFactor(percentage / 100)
    }

    render = () => {
        return <View>
            <View style={this.styles.tipSliderView}>
                <TipSlider
                    onValueChange={tipStore.setTipPercentage}
                    onSlidingComplete={this.handleTipChange}
                    style={this.styles.tipSlider} />
                <T style={this.styles.percentageText}>
                    {tipStore.tipPercentage}%
                </T>
            </View>
            <View style={this.styles.tipRoundButtonView}>
                <TipRoundButton />
            </View>
        </View>
    }
}

@observer
class TipSlider extends PureComponent {
    render = () => {
        return <Slider
                    value={tipStore.tipPercentage}
                    style={this.props.style}
                    onValueChange={this.props.onValueChange}
                    onSlidingComplete={this.props.onSlidingComplete}
                    minimumValue={0}
                    maximumValue={20}
                    step={1}
                    thumbTouchSize={{width: 55, height: 55}}
                    minimumTrackTintColor={config.theme.primary.medium}
                    maximumTrackTintColor='#rgba(0, 0, 0, 0.6)'
                    thumbTintColor={config.theme.primary.dark} />
    }
}

@observer
class TipRoundButton extends PureComponent {
    /* properties:
        updatePercentage: Float => void
    */
    styles = StyleSheet.create({
        buttonStyle: {
            height: 55,
            width: 300,
        },
    })

    @computed get roundedPrice() {
        const n = roundingAmount(orderStore.total) * 100
        return Math.ceil(orderStore.total / n) * n
    }

    @action acceptPrice = () => {
        orderStore.setTipAmount(this.roundedPrice - orderStore.total)
    }

    render = () => {
        return <LargeButton
                    label={`Make it ${orderStore.formatPrice(this.roundedPrice)}`}
                    onPress={this.acceptPrice}
                    style={this.styles.buttonStyle}
                    prominent={false}
                    textColor='#000'
                    borderColor='#000' />
    }
}

const roundingAmount = (price) => {
    const n = price / 100
    if (n < 10) {
        return 1
    } else if (n < 15) {
        return 2
    } else if (n < 50) {
        return 5
    } else if (n < 150) {
        return 10
    } else if (n < 250) {
        return 15
    } else if (n < 1000) {
        return 20
    } else {
        return 50
    }
}
