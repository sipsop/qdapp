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
import { MenuItemModal } from './components/modals/MenuItemModal'
import { modalStore } from './model/store'

@observer
export class App extends Component {

    closeOpeningTimesModal = () => {
        modalStore.closeOpeningTimesModal()
    }
    closeMenuItemModal = () => {
        modalStore.closeMenuItemModal()
    }

    render = () => {
        const showOpeningTimes = modalStore.showOpeningTimesModal
        const showMenuItemModal = modalStore.showMenuItemModal

        if (Platform.OS === 'android') {
            return (
              <View style={{flex: 1}}>
                <Main />
                <OpeningTimesModal onClosedProp={this.closeOpeningTimesModal} isVisible={showOpeningTimes} />
                <MenuItemModal onClosedProp={this.closeOpeningTimesModal} isVisible={showMenuItemModal} />
              </View>
            )
        }
        return (
            <NavigationProvider router={Router}>
                <StackNavigation initialRoute={Router.getRoute('main')} />
                <OpeningTimesModal onClosedProp={this.closeOpeningTimesModal} isVisible={showOpeningTimes} />
                <MenuItemModal onClosedProp={this.closeMenuItemModal} isVisible={showMenuItemModal} />
            </NavigationProvider>
        )
    }
}
