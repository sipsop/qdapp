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

import { barStore, orderStore } from '../Store.js'
import { Page } from '../Page.js'
import { MenuItem, MenuItemImage } from '../MenuPage.js'
import * as _ from '../Curry.js'

@observer
export class OrderList extends Page {
    /* properties:
        orderList: [OrderItem]
    */
    renderView = () => {
        const menuItemsOnOrder = orderStore.getMenuItemsOnOrder(this.props.orderList)
        if (this.props.simple)
            return this.renderSimpleMenuItems(menuItemsOnOrder)
        return this.renderDetailedMenuItems(menuItemsOnOrder)
    }

    renderSimpleMenuItems = (menuItems) => {
        return <View>
            {
                menuItems.map(
                    menuItem =>
                        <SimpleMenuItem
                            key={menuItem.id}
                            menuItem={menuItem}
                            />
                )
            }
        </View>
    }

    renderDetailedMenuItems = (menuItems) => {
        return <View>
            {
                menuItems.map(
                    menuItem =>
                        <MenuItem
                            key={menuItem.id}
                            menuItem={menuItem}
                            />
                )
            }
        </View>
    }
}

const titleTextStyle = {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    // textDecorationLine: 'underline',
    marginRight: 5,
}

@observer
export class SimpleMenuItem extends PureComponent {
    /* properties:
        menuItem: MenuItem
    */
    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = orderStore.getOrderList(menuItem.id)
        return <View style={{flex: 1, flexDirection: 'row'}}>
            <MenuItemImage menuItem={menuItem} />
            <View style={{flex: 1, marginLeft: 10}}>
                <T style={titleTextStyle}>{menuItem.name}</T>
                {
                    orderItems.map((orderItem, rowNumber) => {
                        const stringOpts = _.flatten(
                            barStore.getMenuItemStringOptions(
                                menuItem, orderItem.selectedOptions
                            )
                        )
                        const label = orderItem.amount + ' x ' + stringOpts.join(' + ')
                        return <T key={orderItem.id} style={titleTextStyle}>{label}</T>
                    })
                }
            </View>
            {/*
            <PriceColumn orderItems={orderItems} />
            */}
        </View>
    }
}

const formatOptions = (menuItem, orderItem) => {

}
