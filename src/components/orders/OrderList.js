import {
    React,
    Component,
    View,
    ScrollView,
    PureComponent,
    T,
    StyleSheet,
} from '/components/Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { barStore, orderStore, searchStore } from '/model/store.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { Page } from '../Page.js'
import { MenuItem } from '../menu/DetailedMenuItem.js'
import { MenuItemImage } from '../menu/MenuItemImage.js'
import { FancyMenuItem } from '../menu/FancyMenuItem.js'
import { Header, HeaderText } from '../Header.js'
import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

const { log, assert } = _.utils('./orders/OrderList.js')

// assert(Header != null)
// assert(HeaderText != null)
// assert(MenuItemImage != null)

export class OrderListDescriptor extends Descriptor {
    /* properties:
        menuItems: [MenuItem]
            menu items to show
        orderStore: OrderStore
            store for the orders
        renderHeader: ?() => Component
        renderFooter: ?() => Component
        onRefresh: async () => void
        // visible: (i) => Bool
        //     whether this menu item is visible
    */

    constructor(props, getSimpleListView : () => SimpleListView) {
        super()
        this.props = props
        /* TODO: This is pretty hacky... do this better */
        this.getSimpleListView = getSimpleListView
        this.renderHeader = props.renderHeader
        this.renderFooter = props.renderFooter
        this.refresh = this.props.onRefresh && (
            () => this.runRefresh(this.props.onRefresh)
        )
    }

    styles = StyleSheet.create({
        menuItem: {

        },
        lastMenuItem: {
            marginBottom: 5,
        },
    })

    get numberOfRows() {
        return this.props.menuItems.length
    }

    scrollRelative = (y) => {
        this.getSimpleListView().scrollRelative(y)
    }

    renderRow = (i) => {
        const menuItem = this.props.menuItems[i]
        const style = i === this.numberOfRows - 1 // && orderStore.menuItemsOnOrder.length === 0
            ? this.styles.lastMenuItem
            : undefined

        return (
            <FancyMenuItem
                key={menuItem.id}
                style={style}
                rowNumber={i}
                menuItem={menuItem}
                orderStore={this.props.orderStore}
                      /* visible={() => this.props.visible(i)} */
                showTitle={this.props.showTitle}
                showPrice={this.props.showPrice}
                showHeart={this.props.showHeart}
                scrollRelative={this.scrollRelative} />)
    }
}

@observer
export class OrderList extends PureComponent {
    /* properties:
        menuItems: [MenuItem]
            menu items to show
        orderStore: OrderStore
            store for the orders
        renderHeader: ?() => Component
        renderFooter: ?() => Component
        onRefresh: ?() => void
        visible: (i) => Bool
            whether this menu item is visible
        showTitle: Bool
        showPrice: Bool
        showheart: Bool
    */

    simpleListView = null

    render = () => {
        return <SimpleListView
                    ref={ref => this.simpleListView = ref}
                    descriptor={new OrderListDescriptor(this.props, () => this.simpleListView)}
                    initialListSize={2}
                    pageSize={1} />
    }
}

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
        orderItems: [OrderItem]
        rowNumber: Int
    */
    render = () => {
        const menuItem = this.props.menuItem
        const orderItems = this.props.orderItems
        const orderListHeight = orderItems.length * 50
        const backgroundColor = this.props.rowNumber % 2 === 0
            ? '#fff'
            : config.theme.menuItemBackgroundColorSecondary
        return <View>
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
                    , marginTop: -15
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
                    }
                }>
                <ScrollView horizontal={true}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <HeaderText style={{marginLeft: 100}} fontSize={20}>
                            {menuItem.name}
                        </HeaderText>
                    </View>
                </ScrollView>
            </View>
            <View style={{paddingTop: 15, paddingBottom: 15, backgroundColor: backgroundColor}}>
                {
                    orderItems.map((orderItem, rowNumber) => {
                        const selectedOptions = _.asData(orderItem.selectedOptions)
                        const opts = _.flatten(selectedOptions).join(' + ')
                        const price = orderStore.getTotal(orderItem)
                        const priceText = orderStore.formatPrice(price)
                        return <View key={orderItem.id} style={{flexDirection: 'row', marginBottom: 5}}>
                            <T style={{paddingLeft: 5, minWidth: 50, textAlign: 'center', ...itemTextStyle}}>
                                {orderItem.amount}
                            </T>
                            <ScrollView horizontal={true} style={{paddingLeft: 5, paddingRight: 5}}>
                                <T style={{flex: 1, ...itemTextStyle}}>{opts}</T>
                            </ScrollView>
                            <T style={{minWidth: 80, textAlign: 'right', marginRight: 5, ...itemTextStyle}}>
                                {priceText}
                            </T>
                        </View>
                    })
                }
            </View>
        </View>
    }
}
