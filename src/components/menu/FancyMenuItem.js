import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
} from '/components/Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemOrderList } from './MenuItemOrderList.js'
import { MenuItemCard } from './MenuItemCard.js'
import { BackButton } from '../BackButton.js'
import { FavItemContainer } from '../Fav.js'
import { createOrderItem, orderStore } from '/model/orders/orderstore.js'
import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'
import { tagStore, menuItemModalStore } from '/model/store.js'
import { analytics } from '/model/analytics.js'

const { log, assert } = _.utils('/components/menu/FancyMenuItem.js')

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

    static defaultProps = {
        showTitle: true,
        showPrice: true,
        showHeart: false,
    }

    @action showModal = () => {
        menuItemModalStore.open({menuItem: this.props.menuItem, type: 'Add'})
        analytics.trackMenuItemClicked(this.props.menuItem, this.props.rowNumber)
    }

    // @action modalClosed = (scrollDown) => {
    //     /* The first time scroll down more as we have added a 'Review' button
    //        that takes up some additional space.
    //     */
    //     const scrollPixels =
    //         this.props.orderStore.orderList.length === 1
    //             ? 125
    //             : 60
    //     if (scrollDown)
    //         this.props.scrollRelative(scrollPixels)
    // }

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

    render = () => {
        const menuItem = this.props.menuItem
        const isEven = this.props.rowNumber % 2 === 0
        const backgroundColor = '#fff'
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
                    orderStore={this.props.orderStore}
                    />
            </View>
            <View style={{backgroundColor: '#fff', height: marginBottom}} />
        </View>
    }
}
