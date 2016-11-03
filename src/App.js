import React, { Component } from 'react'
import { observer } from 'mobx-react/native'
import {
  NavigationProvider,
  StackNavigation
} from '@exponent/ex-navigation'
import { Router } from './Router'
import { Main } from './Main'

@observer
export class App extends Component {
    render = () => {
        return (
            <NavigationProvider router={Router}>
                <StackNavigation initialRoute={Router.getRoute('main')} />
            </NavigationProvider>
        )
    }
}
