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
import { MenuItemImage } from './MenuItemImage.js'
import { Price } from '../Price.js'
import { FavItemContainer } from '../Fav.js'
import { createOrderItem, orderStore } from '/model/orderstore.js'
import { OrderList } from '../orders/OrderList.js'
import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'
import { tagStore } from '/model/store.js'

const { log, assert } = _.utils('./menu/DetailedMenuItem.js')

@observer
export class MenuItem extends PureComponent {
    /* properties:
        rowNumber: Int
        menuItem: MenuItem
        orderStore: OrderStore
        // visible: () => Bool
    */

    @observable showModalFor : ?OrderItem = null

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

    // @computed get visible() : Bool {
    //     return this.props.visible()
    // }

    render = () => {
        // if (!this.visible)
        //     return <View />

        const menuItem = this.props.menuItem
        const isEven = this.props.rowNumber % 2 === 0
        const backgroundColor = isEven
            ? '#fff'
            : config.theme.menuItemBackgroundColor
        const marginBottom = this.haveOrderItems ? 10 : 0
        return <View style={{/*marginBottom: marginBottom*/}}>
            <View style={{backgroundColor: backgroundColor}}>
                <TouchableOpacity onPress={this.showModal}>
                    <View style={styles.primaryMenuItemView}>
                        <MenuItemImage menuItem={menuItem} />
                        <View style={viewStyles.content}>
                            <MenuItemHeader menuItem={menuItem} />
                        </View>
                    </View>
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

@observer
class MenuItemHeader extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
    */
    render = () => {
        const menuItem = this.props.menuItem
        return <View style={viewStyles.header}>
            <View style={viewStyles.titleAndPrice}>
                <T
                    lineBreakMode='tail'
                    numberOfLines={1}
                    style={styles.titleText}
                    >
                    {menuItem.name}
                </T>
                <Price price={menuItem.price} style={styles.priceText} />
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <T style={styles.keywordText}>
                        {
                            menuItem.tags
                                .filter(tagStore.tagIsDefined)
                                .map(tagStore.getTagName)
                                .join(' ')
                        }
                    </T>
                    <T style={styles.infoText} numberOfLines={3}>
                        {menuItem.desc}
                    </T>
                </View>
                <FavItemContainer menuItemID={this.props.menuItem.id} style={viewStyles.favIcon} iconSize={45} />
            </View>
        </View>
    }
}

const styles = {
    primaryMenuItemView: {
        flex:           0,
        flexDirection:  'row',
        justifyContent: 'flex-start',
        // alignItems:     'flex-start',
        alignItems:     'flex-start',
        // minHeight:      120,
    },
    image: {
        width:  100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    titleText: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textDecorationLine: 'underline',
        marginRight: 5,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.8)'
    },
    keywordText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.50)',
    },
}


const viewStyles = {
    content: {
        flex:           1,
        flexWrap: 'wrap',
        // marginTop:      5,
        marginLeft:     5,
        marginRight:    5,
    },
    header: {
        flex: 0,
        justifyContent: 'space-around',
        alignItems: 'flex-start'
    },
    titleAndPrice: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    favIcon: {
        flex: 0,
        width: 50,
        height: 50,
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
}
