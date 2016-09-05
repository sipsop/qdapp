import { UIManager } from 'react-native'
import { React, Component, PureComponent, Platform } from '../Component.js'

import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io'

import { LargeButton } from '../Button.js'
import { logger } from '../Curry.js'
import { paymentStore } from './PaymentStore.js'


const log = logger('Payment/CardInput.js')

// const placeHolders = { number: "xxxx xxxx xxxx xxxx", expiry: "MM/YY", cvc: "CVC" }

const scanConfig = {
    requirePostalCode: true,
    // useCardIOLogo: true,
    hideCardIOLogo: true,
}

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class CardInput extends PureComponent {

    componentWillMount = () => {
        if (Platform.OS === 'ios')
            CardIOUtilities.preload()
    }

    scanCard = () => {
        CardIOModule
            .scanCard(scanConfig)
            .then(card => {
                paymentStore.addCard(card)
            })
            .catch(() => {
                // the user cancelled
            })
    }

    render = () => {
        return <LargeButton
                    label="Add a New Card"
                    onPress={this.scanCard}
                    style={largeButtonStyle}
                    />
    }
}

@observer
export class CardInput2 extends PureComponent {

    onChange = (value) => {
        log(value)
    }

    render = () => {
        return <CreditCardInput
                    onChange={this.onChange}
                    placeholders={placeHolders}
                    validColor={'#000000'}
                    placeholderColor={'rgba(0, 0, 0, 0.65)'}
                    />
    }
}

UIManager.setLayoutAnimationEnabledExperimental(true)