import { React, Component, View, ScrollView, PureComponent, T, StyleSheet } from '/components/Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { store, barStore, orderStore, searchStore } from '/model/store'
import { Page } from '../Page'
import { MenuItem } from '../menu/DetailedMenuItem'
import { MenuItemImage } from '../menu/MenuItemImage'
import { Header, HeaderText } from '../Header'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('/components/orders/SimpleOrderList.js')

const styles = StyleSheet.create({
    menuItem: {
        position: 'relative',
    },
    menuItemName: {
        height: 50,
        backgroundColor: config.theme.primary.medium,
        justifyContent: 'center',
        paddingLeft: 5,
        paddingRight: 5,
    },
    menuItemNameText: {
        marginLeft: 100,
    },
    menuItemImage: {
        position: 'absolute',
        top: 0,
        width: 80,
        height: 80,
        borderWidth: 0.5,
        borderColor: '#000',
        borderRadius: 10,
        marginTop: -15,
        marginLeft: 10,
        marginRight: 10,
    },
    menuItemOptions: {
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    itemText: {
        fontSize: 20,
        color: '#000',
    },
    amountText: {
        paddingLeft: 5,
        minWidth: 50,
        textAlign: 'center',
    },
    options: {
        paddingLeft: 5,
        paddingRight: 5,
    },
    optionsText: {
        flex: 1,
    },
    priceText: {
        minWidth: 80,
        textAlign: 'right',
        marginRight: 5,
    },
})

@observer
export class SimpleOrderList extends Page {
    /* properties:
        menuItems: [MenuItem]
            menu items to show
        orderList: [OrderItem]
            order items to show
    */
    renderView = () => {
        assert(this.props.menuItems != null)
        assert(this.props.orderList != null)
        return <View>
            {
                this.props.menuItems.map(
                    (menuItem, i) => {
                        const orderItems = getOrderItems(menuItem, this.props.orderList)
                        return <SimpleMenuItem
                                    key={menuItem.id}
                                    rowNumber={i}
                                    menuItem={menuItem}
                                    orderItems={orderItems}
                                    />
                    }
                )
            }
        </View>
    }
}

const getOrderItems = (menuItem, orderItems) => {
    return orderItems.filter(
        orderItem => menuItem.id === orderItem.menuItemID
    )
}

@observer
class SimpleMenuItem extends PureComponent {
    /* properties:
        menuItem: MenuItem
        orderItems: [OrderItem]
        rowNumber: Int
    */
    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = this.props.orderItems
        const orderListHeight = orderItems.length * 50
        return <View style={styles.menuItem}>
            <View style={styles.menuItemName}>
                <ScrollView horizontal={true}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <HeaderText style={styles.menuItemNameText} fontSize={20}>
                            {menuItem.name}
                        </HeaderText>
                    </View>
                </ScrollView>
            </View>
            <SimpleMenuItemOptions
                orderItems={this.props.orderItems}
                />
            <MenuItemImage
                menuItem={menuItem}
                style={styles.menuItemImage}
                />
        </View>
    }
}

@observer
export class SimpleMenuItemOptions extends PureComponent {
     /* properties:
        orderItems: [OrderItem]
    */
    render = () => {
        const orderItems = this.props.orderItems
        return (
            <View style={styles.menuItemOptions}>
                {
                    orderItems.map((orderItem, rowNumber) => {
                        const selectedOptions = _.asData(orderItem.selectedOptions)
                        const opts = _.flatten(selectedOptions).join(' + ')
                        const price = orderStore.getTotal(orderItem)
                        const priceText = orderStore.formatPrice(price)
                        return <View key={orderItem.id} style={{flexDirection: 'row', marginBottom: 5}}>
                            <T style={[styles.amountText, styles.itemText]}>
                                {orderItem.amount}
                            </T>
                            <ScrollView horizontal={true} style={styles.options}>
                                <T style={[styles.optionsText, styles.itemText]}>
                                    {opts}
                                </T>
                            </ScrollView>
                            <T style={[styles.priceText, styles.itemText]}>
                                {priceText}
                            </T>
                        </View>
                    })
                }
            </View>
        )
    }
}
