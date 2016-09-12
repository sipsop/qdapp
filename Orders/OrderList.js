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
import { Header, HeaderText } from '../Header.js'
import * as _ from '../Curry.js'
import { config } from '../Config.js'

const { log, assert } = _.utils('./Orders/OrderList.js')

// assert(Header != null)
// assert(HeaderText != null)
// assert(MenuItemImage != null)

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
                    (menuItem, i) =>
                        <MenuItem
                            key={menuItem.id}
                            rowNumber={i}
                            menuItem={menuItem}
                            />
                )
            }
        </View>
    }
}

const titleTextStyle = {
    fontSize: 25,
    fontWeight: 'bold',
    color: config.theme.primary.medium, //'#000',
    textDecorationLine: 'underline',
}

const itemTextStyle = {
    fontSize: 20,
    color: '#000',
}

@observer
export class SimpleMenuItem extends PureComponent {
    /* properties:
        menuItem: MenuItem
    */
    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = orderStore.getOrderList(menuItem.id)
        const orderListHeight = orderItems.length * 50
        return <View >
            <MenuItemImage
                menuItem={menuItem}
                style={
                    { position: 'absolute'
                    , zIndex: 2
                    , width: 80
                    , height: 80
                    , borderWidth: 0.5
                    , borderColor: '#000'
                    , borderRadius: 10
                    , marginLeft: 10
                    , marginRight: 10
                    }
                }
                />
            <View style={
                    { height: 50
                    , backgroundColor: config.theme.primary.medium
                    , justifyContent: 'center'
                    , paddingLeft: 5
                    , paddingRight: 5
                    , marginTop: 15
                    , marginBottom: 15
                    }
                }>
                <ScrollView horizontal={true}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <HeaderText style={{marginLeft: 100}}>
                            {menuItem.name}
                        </HeaderText>
                    </View>
                </ScrollView>
            </View>
            <View>
                {
                    orderItems.map((orderItem, rowNumber) => {
                        const stringOpts = _.flatten(
                            barStore.getMenuItemStringOptions(
                                menuItem, orderItem.selectedOptions
                            )
                        )
                        const opts = stringOpts.join(' + ')
                        const price = orderStore.getTotal(orderItem).toFixed(2)
                        return <View key={orderItem.id} style={{flexDirection: 'row', marginBottom: 5}}>
                            <T style={{paddingLeft: 5, minWidth: 50, textAlign: 'center', ...itemTextStyle}}>
                                {orderItem.amount}
                            </T>
                            <ScrollView horizontal={true} style={{paddingLeft: 5, paddingRight: 5}}>
                                <T style={{flex: 1, ...itemTextStyle}}>{opts}</T>
                            </ScrollView>
                            <T style={{minWidth: 80, textAlign: 'right', marginRight: 5, ...itemTextStyle}}>
                                £{price}
                            </T>
                        </View>
                    })
                }
            </View>
        </View>
    }
}
