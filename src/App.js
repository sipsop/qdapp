import React, { Component } from 'react'
import { Platform, View } from 'react-native'
import { observer } from 'mobx-react/native'
import {
  NavigationProvider,
  StackNavigation
} from '@exponent/ex-navigation'
import { Router } from './Router'
import { Main } from './Main'
import { OpeningTimesModal } from './components/modals/OpeningTimesModal'
import { RequestBookingModal } from './components/modals/RequestBookingModal'
import { modalStore } from './model/store'

@observer
export class App extends Component {
    closeOpeningTimesModal = () => {
        modalStore.openOpeningModal()
    }
    closeRequestBookingModal = () => {
        modalStore.closeBookingModal()
    }
    componentDidMount() {
        console.disableYellowBox = true;
    }
    render = () => {
        const showOpeningTimes = modalStore.showOpeningTimesModal
        const showBookingModal = modalStore.showBookingRequestModal
        if (Platform.OS === 'android')
            return (
              <View style={{flex: 1}}>
                <Main />
                <OpeningTimesModal onClosedProp={this.closeOpeningTimesModal} isVisible={showOpeningTimes} />
              </View>
            )
        return (
            <NavigationProvider router={Router}>
                <StackNavigation initialRoute={Router.getRoute('main')} />
                <OpeningTimesModal onClosedProp={this.closeOpeningTimesModal} isVisible={showOpeningTimes} />
                <RequestBookingModal onClosedProp={this.closeBookingModal} isVisible={showBookingModal} />
            </NavigationProvider>
        )
    }
}
