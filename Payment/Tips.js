import {
    React, Component, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, StyleSheet,
} from '../Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import Slider from 'react-native-slider'

import { TextHeader } from '../Header.js'
import { LargeButton } from '../Button.js'
import { orderStore } from '../Store.js'
import { config } from '../Config.js'
import { analytics } from '../Analytics.js'
import * as _ from '../Curry.js'

import type { String, Int } from '../Types.js'

const { log, assert } = _.utils('Payment/Tips.js')


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
export class TipComponent extends PureComponent {
    styles = {
        tipView: {
            marginBottom: 10,
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
            marginRight: 5,
        },

        tipRoundButtonView: {
            alignItems: 'flex-end',
            marginRight: 5,
        },
    }

    @action handleTipChange = (percentage) => {
        orderStore.setTipFactor(percentage / 100)
    }

    render = () => {
        return <View style={this.styles.tipView}>
            <TextHeader label="Add a Tip" rowHeight={55} />
            <View style={this.styles.tipSliderView}>
                <TipSlider
                    onValueChange={tipStore.setTipPercentage}
                    onSlidingComplete={this.handleTipChange}
                    style={this.styles.tipSlider} />
                <T style={this.styles.percentageText}>
                    {tipStore.tipPercentage.toFixed(1)}%
                </T>
            </View>
            {/*
            <View style={this.styles.tipRoundButtonView}>
                <TipRoundButton />
            </View>
            */}
        </View>
    }
}

@observer
class TipSlider extends PureComponent {
    render = () => {
        return <Slider
                    value={_.min(20, tipStore.tipPercentage)}
                    style={this.props.style}
                    onValueChange={this.props.onValueChange}
                    onSlidingComplete={this.props.onSlidingComplete}
                    minimumValue={0}
                    maximumValue={20}
                    step={1}
                    thumbTouchSize={{width: 80, height: 80}}
                    minimumTrackTintColor={config.theme.primary.medium}
                    maximumTrackTintColor='#rgba(0, 0, 0, 0.6)'
                    thumbTintColor={config.theme.primary.dark} />
    }
}

@observer
export class TipRoundButton extends PureComponent {
    /* properties:
        updatePercentage: Float => void
    */
    styles = StyleSheet.create({
        buttonStyle: {
            height: 40,
        },
    })

    @computed get roundedPrice() {
        const total = orderStore.total
        const max = total + 0.2 * total

        const totalPlusTip = orderStore.totalPlusTip
        var r = roundingAmount(totalPlusTip)
        var n = r * 100
        var i = _.find(roundingAmounts, r)

        var rounded
        while (i >= 0) {
            n = roundingAmounts[i] * 100
            rounded = Math.ceil(totalPlusTip / n) * n
            log("n", n, "totalPlusTip", totalPlusTip, "rounded", rounded)
            if (rounded <= max)
                break
            i -= 1
        }
        return rounded
    }

    @action acceptPrice = () => {
        orderStore.setTipAmount(this.roundedPrice - orderStore.total)
    }

    render = () => {
        if (this.roundedPrice === orderStore.totalPlusTip)
            return <View />
        if (this.roundedPrice > orderStore.total + orderStore.total * 0.2)
            return <View />
        return <LargeButton
                    label={`Make it ${orderStore.formatPrice(this.roundedPrice)}`}
                    onPress={this.acceptPrice}
                    style={this.styles.buttonStyle}
                    prominent={false}
                    textColor='#000'
                    fontSize={15}
                    borderColor='#000' />
    }
}

const roundingAmounts = [
    0.5,
    1,
    2,
    5,
    10,
    15,
    20,
    50,
]

const roundingAmount = (price, max) => {
    const n = price / 100
    if (n < 3) {
        return 0.5
    } else if (n < 10) {
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
