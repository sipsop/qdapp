import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
    T,
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItem, createMenuItem } from '../MenuPage.js'
import { LargeButton } from '../Button.js'
import { Popup } from '../Payment/Popup.js'
import { store, tabStore } from '../Store.js'
import { config } from '../Config.js'

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class OrderPage extends Component {

    @observable popupVisible = false

    render = () => {
        if (store.menuItemsOnOrder.length > 0)
            return this.renderOrderList()
        return this.renderEmptyOrder()
    }

    renderOrderList = () => {
        return <View style={{flex: 1}}>
            <Popup
                visible={this.popupVisible}
                onClose={() => this.popupVisible = false}
                />
            <ScrollView style={{flex: 1}}>
                {
                    store.menuItemsOnOrder.map(
                        menuItem =>
                            <MenuItem
                                key={menuItem.id}
                                menuItem={menuItem}
                                currentPage={3}
                                />
                    )
                }
            </ScrollView>
            <LargeButton
                label="Place Order"
                style={largeButtonStyle}
                onPress={() => this.popupVisible = true}
                />
        </View>
    }

    renderEmptyOrder = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Add Items to Order"
                onPress={() => tabStore.setCurrentTab(2)}
                style={largeButtonStyle}
                />
        </View>
    }
}
