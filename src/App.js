import { React, Component, View, TouchableOpacity, PureComponent, Platform, T } from '/components/Component.js'
import { observer } from 'mobx-react/native'
import {
  NavigationProvider,
  StackNavigation
} from '@exponent/ex-navigation'

import { Router } from './Router'
import { Main } from './Main'
import { OpeningTimesModal } from './components/modals/OpeningTimesModal'
import { MessagePopup } from '/components/messages/MessagePopup'
import { ConfirmDeliveryModal } from '/components/orders/ConfirmDeliveryModal'
import { modalStore } from './model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components/App')

@observer
export class App extends PureComponent {
    render = () => {
        log("SHOW DELIVER MODAL", modalStore.showDeliveryModal)
        return (
            <MainApp>
                <OpeningTimesModal
                    isVisible={modalStore.showOpeningTimesModal}
                    onClosedProp={modalStore.closeOpeningTimesModal}
                    />
                <MessagePopup />
                <ConfirmDeliveryModal
                    isVisible={() => modalStore.showConfirmDeliveryModal}
                    onClose={modalStore.closeConfirmDeliveryModal}
                    />
            </MainApp>
        )
    }
}

@observer
class MainApp extends PureComponent {
    render = () => {
        if (Platform.OS === 'android') {
            return (
                <View style={{flex: 1}}>
                    <Main />
                    {this.props.children}
                </View>
            )
        } else {
            return (
                <NavigationProvider router={Router}>
                    <StackNavigation initialRoute={Router.getRoute('main')} />
                    {this.props.children}
                </NavigationProvider>
            )
        }
    }
}
