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

import { store, barStore, orderStore, searchStore } from '/model/store'
import { SimpleListView, Descriptor } from '../SimpleListView'
import { Page } from '../Page'
import { MenuItem } from '../menu/DetailedMenuItem'
import { MenuItemImage } from '../menu/MenuItemImage'
import { FancyMenuItem } from '../menu/FancyMenuItem'
import { Header, HeaderText } from '../Header'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('./components/orders/OrderList.js')

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

    @computed get rows() {
        return this.props.getMenuItems()
    }

    rowHasChanged = (menuItem1, menuItem2) => {
        return menuItem1.id !== menuItem2.id
    }

    scrollRelative = (y) => {
        this.getSimpleListView().scrollRelative(y)
    }

    renderRow = (menuItem, i) => {
        // log("RENDERING MENU ITEM", i)
        var style = undefined
        if (i === this.rows.length - 1)
            style = this.styles.lastMenuItem

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
                scrollRelative={this.scrollRelative}
                />
        )
    }
}

@observer
export class OrderList extends PureComponent {
    /* properties:
        getMenuItems: () => [MenuItem]
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
    getScrollView = () => this.simpleListView

    render = () => {
        const orderListDesc = new OrderListDescriptor(
            this.props,
            () => store.orderListScrollView,
        )
        return <SimpleListView
                    /* TODO: This should probably move to MenuPage! */
                    ref={(ref) => {
                        store.orderListScrollView = ref
                    }}
                    descriptor={orderListDesc}
                    /* NOTE:
                        This does not give enough space to trigger
                        onEndReached() with a threshold of 500px
                    */
                    /* visibleRowsIncrement={3} */
                    initialListSize={2}
                    pageSize={1} />
    }
}
