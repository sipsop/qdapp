import { UIManager } from 'react-native'
import { React, Component, PureComponent, Platform } from '/components/Component'
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io'

import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { LargeButton } from '../Button'
import { logger } from '/utils/curry'
import { paymentStore } from '/model/orders/paymentstore'
import { analytics } from '/model/analytics'
import { config } from '/utils/config'


const log = logger('Payment/CardInput')

// const placeHolders = { number: "xxxx xxxx xxxx xxxx", expiry: "MM/YY", cvc: "CVC" }

const scanConfig = {
    requirePostalCode: true,
    // useCardIOLogo: true,
    hideCardIOLogo: true,
}

const addCardButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class CardInput extends PureComponent {
    /* properties:
        label: String
            label to render on the button
        trackPress: ?() => void
        trackSuccess: ?() => void
        trackFailure: ?() => void
    */

    componentWillMount = () => {
        if (Platform.OS === 'ios') {
            CardIOUtilities.preload()
        }
    }

    scanCard = () => {
        CardIOModule
            .scanCard(scanConfig)
            .then(card => {
                paymentStore.addCard(card)
                this.props.trackSuccess && this.props.trackSuccess()
                analytics.trackEnterPaymentInfo()
            })
            .catch(() => {
                // the user cancelled
                this.props.trackFailure && this.props.trackFailure()
            })
    }

    handlePress = () => {
        this.props.trackPress && this.props.trackPress()
        this.scanCard()
    }

    render = () => {
        return makeAddCardButton(this.props.label, this.handlePress)
    }
}

export const makeAddCardButton = (label : String, onPress : () => void) => {
    return <LargeButton
            label={label}
            onPress={onPress}
            style={addCardButtonStyle}
            prominent={false}
            textColor={config.theme.addColor}
            borderColor={config.theme.addColor} />
}

if (Platform.OS !== 'ios')
    UIManager.setLayoutAnimationEnabledExperimental(true)
