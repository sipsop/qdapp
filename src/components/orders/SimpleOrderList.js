import { React, Component, View, ScrollView, PureComponent, T, StyleSheet, TouchableOpacity, EvilIcon } from '/components/Component'
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
        alignItems: 'center',
        // marginBottom: 5,
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
                        return (
                            <SimpleMenuItem
                                key={menuItem.id}
                                rowNumber={i}
                                menuItem={menuItem}
                                orderItems={this.props.orderList}
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

    @computed get refundable() {
        return !!this.props.refundStore
    }

    @computed get orderItems() {
        if (this.refundable) {
            /* TODO: Return only those items that can still be refunded */
            // return this.props.orderItems
            return this.props.refundStore.getOrderList()
        }
        return this.props.orderItems
    }


    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = getOrderItems(menuItem, this.orderItems)
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
                orderItems={orderItems}
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
        return (
            <View style={styles.menuItemOptions}>
                {this.props.orderItems.map(this.renderOrderItem)}
            </View>
        )
    }

    renderOrderItem = (orderItem, rowNumber) => {
        const selectedOptions = _.asData(orderItem.selectedOptions)
        const opts = _.flatten(selectedOptions).join(' + ')
        const price = orderStore.getTotal(orderItem)
        const priceText = orderStore.formatPrice(price)
        return (
            <View key={rowNumber} style={styles.orderItemRow}>
                <T style={[styles.amountText, styles.itemText]}>
                    {!this.refundable
                        ? orderItem.amount
                        : "refund: "
                    }
                </T>
                <ScrollView horizontal={true} style={styles.options}>
                    <T style={[styles.optionsText, styles.itemText]}>
                        {opts}
                    </T>
                </ScrollView>
                { this.refundable &&
                    <RefundItem
                        refundStore={this.props.refundStore}
                        orderItem={orderItem}
                        />
                }
                <T style={[styles.priceText, styles.itemText]}>
                    {priceText}
                </T>
            </View>
        )
    }
}

const iconBoxSize = 55
const iconSize = 45

@observer
class RefundItem extends PureComponent {
    /* properties:
        refundStore: RefundStore
        orderItem: OrderItem
    */

    @computed get refunded() {
        return this.props.refundStore.refunded(this.props.orderIndex)
    }

    @action selectRefundItem = (value) => {
        if (this.refunded)
            this.props.refundStore.removeRefund(this.props.orderIndex)
        else
            this.props.refundStore.addRefund(this.props.orderIndex)
    }

    @action handleIncrease = () => {

    }

    @action handleDecrease = () => {

    }

    render = () => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <TouchableOpacity onPress={this.handleDecrease} style={{height: iconBoxSize, justifyContent: 'center'}}>
                    <EvilIcon name="minus" size={iconSize} color={config.theme.removeColor} />
                </TouchableOpacity>
                <T style={[styles.amountText, styles.itemText]}>
                    {this.props.orderItem.amount}
                </T>
                <TouchableOpacity
                        onPress={this.handleIncrease}
                        style={{height: iconBoxSize, justifyContent: 'center'}}
                        >
                    <EvilIcon name="plus" size={iconSize} color={config.theme.addColor} />
                </TouchableOpacity>
            </View>
        )
    }
}
