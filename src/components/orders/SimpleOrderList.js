import { React, Component, View, ScrollView, PureComponent, T, StyleSheet, Switch } from '/components/Component'
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
    orderItemRow: {
        flexDirection: 'row',
        marginBottom: 5,
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
    refundText: {
        flex: 1,
        textAlign: 'right',
        marginRight: 5,
    },
    refundSwitch: {
        alignItems: 'flex-end',
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
        refundStore: ?RefundStore
            to allow the bar admin to select refunds for the items
    */
    renderView = () => {
        assert(this.props.menuItems != null)
        assert(this.props.orderList != null)
        return <View>
            {
                this.props.menuItems.map(
                    (menuItem, i) => {
                        const orderItems = getOrderItems(menuItem, this.props.orderList)
                        return (
                            <SimpleMenuItem
                                key={menuItem.id}
                                rowNumber={i}
                                menuItem={menuItem}
                                orderItems={orderItems}
                                refundStore={this.props.refundStore}
                                />
                        )
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
        refundStore: ?RefundStore
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
                refundStore={this.props.refundStore}
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
        refundStore: ?RefundStore
    */

    @computed get refundable() {
        return !!this.props.refundStore
    }

    render = () => {
        const orderItems = this.props.orderItems
        return (
            <View style={styles.menuItemOptions}>
                {orderItems.map(this.renderOrderItem)}
            </View>
        )
    }

    renderOrderItem = (orderItem, rowNumber) => {
        const selectedOptions = _.asData(orderItem.selectedOptions)
        const opts = _.flatten(selectedOptions).join(' + ')
        const price = orderStore.getTotal(orderItem)
        const priceText = orderStore.formatPrice(price)
        return (
            <View key={orderItem.id}>
                <View style={styles.orderItemRow}>
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
                { this.refundable &&
                    <View style={styles.orderItemRow}>
                        <T style={[styles.refundText, styles.itemText]}>
                            refund
                        </T>
                        <RefundSwitch
                            refundStore={this.props.refundStore}
                            orderItem={orderItem}
                            style={styles.refundSwitch}
                            />
                    </View>
                }
            </View>
        )
    }
}

@observer
class RefundSwitch extends PureComponent {
    /* properties:
        refundStore: RefundStore
        orderItem: OrderItem
        style: style obj
    */
    @computed get refunded() {
        return this.props.refundStore.refunded(this.props.orderItem)
    }

    @action selectRefundItem = (value) => {
        if (this.refunded)
            this.props.refundStore.removeRefundOrderItem(this.props.orderItem)
        else
            this.props.refundStore.addRefundOrderItem(this.props.orderItem)
    }

    render = () => {
        return (
            <Switch
                value={this.refunded}
                onValueChange={this.selectRefundItem}
                style={this.props.style}
                />
        )
    }
}
