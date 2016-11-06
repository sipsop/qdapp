import React, { Component } from 'react'
import { Platform } from 'react-native'
import { observer } from 'mobx-react/native'
import {
  NavigationProvider,
  StackNavigation
} from '@exponent/ex-navigation'
import { Router } from './Router'
import { Main } from './Main'
import { OpeningTimesModalV } from './components/modals/OpeningTimesModal'

@observer
export class App extends Component {
    render = () => {
        if (Platform.OS === 'android')
            return <Main />
        return (
            <NavigationProvider router={Router}>
                <StackNavigation initialRoute={Router.getRoute('main')} />
                <OpeningTimesModalV />
            </NavigationProvider>
        )
    }
}
