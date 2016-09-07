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

import { Page } from '../Page.js'
import { MenuItem, createMenuItem } from '../MenuPage.js'
import { LargeButton } from '../Button.js'
import { Popup } from '../Payment/Popup.js'
import { store, tabStore, orderStore } from '../Store.js'
import { config } from '../Config.js'

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class OrderPage extends Page {

    @observable popupVisible = false

    handleOrderPress = () => {
        this.popupVisible = true
    }

    renderView = () => {
        if (orderStore.menuItemsOnOrder.length > 0)
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
                    orderStore.menuItemsOnOrder.map(
                        menuItem =>
                            <MenuItem
                                key={menuItem.id}
                                menuItem={menuItem}
                                currentPage={3}
                                />
                    )
                }
            </ScrollView>
            <OrderButton onPress={this.handleOrderPress} />
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

@observer
class OrderButton extends PureComponent {
    /* properties:
        onPress: () => void
    */
    render = () => {
        if (!orderStore.haveOrders)
            return <View />
        return <LargeButton
                    label={`Place Order  ${orderStore.totalTextWithParens}`}
                    style={largeButtonStyle}
                    onPress={this.props.onPress}
                    />
    }
}
