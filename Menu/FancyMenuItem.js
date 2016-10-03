import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
} from '../Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemOrderList } from './MenuItemOrderList.js'
import { MenuItemImage, getMenuItemImage } from './MenuItemImage.js'
import { MenuItemCard } from './MenuItemCard.js'
import { BackButton } from '../BackButton.js'
import { Price } from '../Price.js'
import { FavItemContainer } from '../Fav.js'
import { createOrderItem, orderStore } from '../Orders/OrderStore.js'
import { OrderList } from '../Orders/OrderList.js'
import * as _ from '../Curry.js'
import { config } from '../Config.js'
import { tagStore } from '../Store.js'

const { log, assert } = _.utils('./Menu/DetailedMenuItem.js')

@observer
export class FancyMenuItem extends PureComponent {
    /* properties:
        rowNumber: Int
        menuItem: MenuItem
        orderStore: OrderStore
        show{Title,Price,Heart}: Bool
    */

    @observable showModalFor : ?OrderItem = null

    static defaultProps = {
        showTitle: true,
        showPrice: true,
        showHeart: false,
    }

    @action showModal = () => {
        const orderItem = createOrderItem(this.props.menuItem)
        this.props.orderStore.addOrderItem(orderItem)
        this.showModalFor = orderItem
    }

    @action modalClosed = () => {
        this.showModalFor = null
    }

    @computed get haveOrderItems() : Array<OrderItem> {
        return this.props.orderStore.getOrderList(this.props.menuItem.id).length > 0
    }

    styles = StyleSheet.create({
        menuItemCard: {
            margin: 5,
        },
    })

    render = () => {
        const menuItem = this.props.menuItem
        if (!getMenuItemImage(menuItem))
            return <View />
        const isEven = this.props.rowNumber % 2 === 0
        const backgroundColor = isEven
            ? '#fff'
            : config.theme.menuItemBackgroundColor
        const marginBottom = this.haveOrderItems ? 10 : 0

        return <View style={{/*marginBottom: marginBottom*/}}>
            <View style={{backgroundColor: backgroundColor}}>
                <TouchableOpacity
                        onPress={this.showModal}
                        style={this.styles.menuItemCard}
                        >
                    <MenuItemCard
                        imageHeight={200}
                        menuItem={this.props.menuItem}
                        showTitle={this.props.showTitle}
                        showPrice={this.props.showPrice}
                        showHeart={this.props.showHeart}
                        />
                </TouchableOpacity>
                <MenuItemOrderList
                    menuItem={menuItem}
                    showModalFor={this.showModalFor}
                    onModalClose={this.modalClosed}
                    orderStore={this.props.orderStore}
                    />
            </View>
            <View style={{backgroundColor: '#fff', height: marginBottom}} />
        </View>
    }
}