import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { orderStore } from './OrderStore.js'
import { Page } from '../Page.js'
import { MenuItem } from '../MenuPage.js'

@observer
export class OrderList extends Page {
    /* properties:
        orderList: [OrderItem]
    */
    renderView = () => {
        const menuItemsOnOrder = orderStore.getMenuItemsOnOrder(this.props.orderList)
        return <View>
            {
                menuItemsOnOrder.map(
                    menuItem =>
                        <MenuItem
                            key={menuItem.id}
                            menuItem={menuItem}
                            currentPage={3}
                            />
                )
            }
        </View>
    }
}
