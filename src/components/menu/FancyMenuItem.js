import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
} from '~/src/components/Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemOrderList } from './MenuItemOrderList.js'
import { MenuItemImage, getMenuItemImage } from './MenuItemImage.js'
import { MenuItemCard } from './MenuItemCard.js'
import { BackButton } from '../BackButton.js'
import { Price } from '../Price.js'
import { FavItemContainer } from '../Fav.js'
import { createOrderItem, orderStore } from '~/src/model/orders/orderstore.js'
import { OrderList } from '../orders/OrderList.js'
import * as _ from '~/src/utils/curry.js'
import { config } from '~/src/utils/config.js'
import { tagStore } from '~/src/model/store.js'
import { analytics } from '~/src/model/analytics.js'

const { log, assert } = _.utils('./menu/DetailedMenuItem.js')

@observer
export class FancyMenuItem extends PureComponent {
    /* properties:
        rowNumber: Int
        menuItem: MenuItem
        orderStore: OrderStore
        show{Title,Price,Heart}: Bool
        style: style object
        scrollRelative: () => void
            scroll vertically relative to the current scroll position
    */

    @observable showModalFor : ?OrderItem = null
    tracked = false

    static defaultProps = {
        showTitle: true,
        showPrice: true,
        showHeart: false,
    }

    @action showModal = () => {
        const orderItem = createOrderItem(this.props.menuItem)
        this.props.orderStore.addOrderItem(orderItem)
        this.showModalFor = orderItem
        analytics.trackMenuItemClicked(this.props.menuItem, this.props.rowNumber)
    }

    @action modalClosed = (scrollDown) => {
        this.showModalFor = null
        /* The first time scroll down more as we have added a 'Review' button
           that takes up some additional space.
        */
        const scrollPixels =
            this.props.orderStore.orderList.length === 1
                ? 125
                : 60
        if (scrollDown)
            this.props.scrollRelative(scrollPixels)
    }

    @computed get haveOrderItems() : Array<OrderItem> {
        return this.props.orderStore.getOrderList(this.props.menuItem.id).length > 0
    }

    styles = StyleSheet.create({
        menuItemCard: {
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
        },
    })

    componentDidMount = () => {
        /* TODO: Is this guard necessary? */
        if (!this.tracked) {
            // analytics.trackScrollMenu(this.props.rowNumber)
            // analytics.trackMenuItemViewed(this.props.menuItem, this.props.rowNumber)
            this.tracked = true
        }
    }

    render = () => {
        const menuItem = this.props.menuItem
        const isEven = this.props.rowNumber % 2 === 0
        const backgroundColor = '#fff'
            // isEven
            //     ? '#fff'
            //     : config.theme.menuItemBackgroundColor
        const marginBottom = this.haveOrderItems ? 0 : 0

        return <View style={this.props.style}>
            <View style={{backgroundColor: backgroundColor}}>
                <TouchableOpacity
                        onPress={this.showModal}
                        style={this.styles.menuItemCard}
                        >
                    <MenuItemCard
                        imageHeight={175}
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
