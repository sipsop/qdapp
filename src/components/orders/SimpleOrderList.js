import { React, Component, View, ScrollView, PureComponent, T, StyleSheet, TouchableOpacity, EvilIcon } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from '../Page'
import { MenuItem } from '../menu/DetailedMenuItem'
import { MenuItemImage } from '../menu/MenuItemImage'
import { Header, HeaderText } from '../Header'

import { store, barStore, searchStore, refundStore } from '/model/store'
import { orderStore, normalizeOrderList, getRefundedOrderItems } from '/model/orders/orderstore'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('/components/orders/SimpleOrderList.js')

const styles = StyleSheet.create({
    orderList: {

    },
    menuItem: {
        position: 'relative',
        marginBottom: 10,
    },
    menuItemName: {
        height: 50,
        backgroundColor: config.theme.primary.medium,
        justifyContent: 'center',
        paddingLeft: 5,
        paddingRight: 5,
    },
    menuItemNameStrikeThrough: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    menuItemNameText: {
        marginLeft: 100,
    },
    strikeThrough: {
        textDecorationLine: 'line-through',
        color: 'rgba(0, 0, 0, 0.4)',
    },
    strikeThroughHeader: {
        textDecorationLine: 'line-through',
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
        flex: 2,
        paddingLeft: 5,
        paddingRight: 5,
    },
    optionsText: {
        flex: 1,
        textAlign: 'center',
        paddingLeft: 5,
    },
    priceText: {
        minWidth: 80,
        textAlign: 'right',
        marginRight: 5,
    },
    refundOptions: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 55,
    },
    refundText: {
        textAlign: 'center',
        marginLeft: 5,
        marginRight: 5,
    },
    refundSwitch: {
        alignItems: 'flex-end',
        marginRight: 5,
        textAlign: 'center',
    },
})

/* Order list used for the receipt and admin views.
   In the simple order list the menu item options can no longer be modified.
*/
@observer
export class SimpleOrderList extends PureComponent {
    /* properties:
        orderResult: OrderResult
        showRefundOptions: Bool
            whether to show refund options (+ and - signs)
    */

    static defaultProps = {
        showRefundOptions: false,
    }

    @computed get normalizedOrderList() {
        return normalizeOrderList(this.props.orderResult)
    }

    @computed get refundedOrderList() {
        return getRefundedOrderItems(this.props.orderResult)
    }

    render = () => {
        return (
            <View>
                <View style={{height: 20}} />
                <OrderList
                    menuItems={this.props.orderResult.menuItems}
                    orderList={this.normalizedOrderList}
                    showRefundOptions={this.props.showRefundOptions}
                    />
                { this.refundedOrderList.length > 0 &&
                    <View>
                        <OrderList
                            menuItems={this.props.orderResult.menuItems}
                            orderList={this.refundedOrderList}
                            strikeThrough={true}
                            showRefundOptions={false}
                            />
                    </View>
                }
            </View>
        )
    }
}

@observer
class OrderList extends PureComponent {
    /* properties:
        menuItems: [MenuItem]
            menu items to show
        orderList: [OrderItem]
            order items to show
        strikeThrough: Bool
            whether to strike through the items (e.g. in case they have been
            refunded)
        showRefundOptions: Bool
            whether to show refund options (+ and - signs)
    */

    static defaultProps = {
        showRefundOptions: false,
        strikeThrough: false,
    }

    render = () => {
        assert(this.props.menuItems != null)
        assert(this.props.orderList != null)
        return (
            <View style={styles.orderList}>
                { this.props.menuItems.map(
                    (menuItem, i) =>
                        <SimpleMenuItem
                            key={menuItem.id}
                            rowNumber={i}
                            menuItem={menuItem}
                            orderItems={this.props.orderList}
                            strikeThrough={this.props.strikeThrough}
                            showRefundOptions={this.props.showRefundOptions}
                            />
                    )
                }
            </View>
        )
    }
}

const getOrderItems = (menuItem, orderItems) => {
    return orderItems.filter(
        orderItem => menuItem.id === orderItem.menuItemID && orderItem.amount > 0
    )
}

@observer
class SimpleMenuItem extends PureComponent {
    /* properties:
        menuItem: MenuItem
        orderItems: [OrderItem]
        rowNumber: Int
        strikeThrough: Bool
            whether to strike through the items (e.g. in case they have been
            refunded)
        showRefundOptions: Bool
            whether to show refund options (+ and - signs)
    */
    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = getOrderItems(menuItem, this.props.orderItems)
        if (!orderItems.length)
            return null
        const orderListHeight = orderItems.length * 50
        return <View style={styles.menuItem}>
            <View style={[
                    styles.menuItemName,
                    this.props.strikeThrough && styles.menuItemNameStrikeThrough,
                ]}>
                <ScrollView horizontal={true}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <HeaderText style={[
                                styles.menuItemNameText,
                                this.props.strikeThrough && styles.strikeThroughHeader,
                            ]} fontSize={20}>
                            {menuItem.name}
                        </HeaderText>
                    </View>
                </ScrollView>
            </View>
            <SimpleMenuItemOptions
                orderItems={orderItems}
                strikeThrough={this.props.strikeThrough}
                showRefundOptions={this.props.showRefundOptions}
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
        strikeThrough: Bool
            whether to strike through the items (e.g. in case they have been
            refunded)
        showRefundOptions: Bool
            whether to show refund options (+ and - signs)
    */

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
                {!this.props.showRefundOptions &&
                    <T style={[
                            styles.amountText,
                            styles.itemText,
                            this.props.strikeThrough && styles.strikeThrough,
                        ]}>
                        {orderItem.amount}
                    </T>
                }
                <ScrollView horizontal={true} style={styles.options}>
                    <T style={[
                            styles.optionsText,
                            styles.itemText,
                            this.props.strikeThrough && styles.strikeThrough,
                        ]}>
                        {opts}
                    </T>
                </ScrollView>
                { this.props.showRefundOptions &&
                    <RefundOptions
                        orderItem={orderItem}
                        />
                }
                <T style={[
                        styles.priceText,
                        styles.itemText,
                        this.props.strikeThrough && styles.strikeThrough,
                    ]}>
                    {priceText}
                </T>
            </View>
        )
    }
}

@observer
class RefundOptions extends PureComponent {
    /* properties:
        orderItem: OrderItem
    */

    @action handleIncrease = () => {
        refundStore.increaseRefundAmount(this.props.orderItem.id)
    }

    @action handleDecrease = () => {
        refundStore.decreaseRefundAmount(this.props.orderItem.id)
    }

    render = () => {
        const textStyle = [styles.refundText, styles.itemText]
        return (
            <View style={styles.refundOptions}>
                <TouchableOpacity onPress={this.handleDecrease}>
                    <EvilIcon name="minus" size={45} color={config.theme.removeColor} />
                </TouchableOpacity>
                <T style={textStyle}>
                    {refundStore.refundAmount(this.props.orderItem)}
                </T>
                <TouchableOpacity onPress={this.handleIncrease}>
                    <EvilIcon name="plus" size={45} color={config.theme.addColor} />
                </TouchableOpacity>
                <T style={textStyle}>/</T>
                <T style={textStyle}>{this.props.orderItem.amount}</T>
            </View>
        )
    }
}
