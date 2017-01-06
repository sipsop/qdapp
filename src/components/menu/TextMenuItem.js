import { React, Component, View, TouchableOpacity, PureComponent, Img, StyleSheet, T, } from '/components/Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemOrderList } from './MenuItemOrderList'
import { BackButton } from '../BackButton'
import { Price } from '../Price.js'
import { createOrderItem, orderStore } from '/model/orders/orderstore'
import { menuItemModalStore } from '/model/store'
import { getMenuItemCategory } from '/model/barstore'
import { analytics } from '/model/analytics'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('/components/menu/TextMenuItem.js')

const styles = StyleSheet.create({
    textMenuItem: {
        marginLeft: 0,
        marginRight: 0,
        paddingLeft: 5,
        paddingRight: 5,
        marginTop: 5,
        backgroundColor: '#fff',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
        marginRight: 5,
        height: 55,
        paddingLeft: 5,
        paddingRight: 5,
    },
    menuItem: {
        // flexDirection: 'row',
        // alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    price: {
        color: '#fff',
        fontSize: 18,
    },
    title: {
        color: '#fff',
        fontSize: 22,
    },
    tag: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 17,
    },
})


@observer
export class TextMenuItem extends PureComponent {
    /* properties:
        rowNumber: Int
        menuItem: MenuItem
        orderStore: OrderStore
        showPrice: Bool
    */

    @action showModal = () => {
        menuItemModalStore.open({menuItem: this.props.menuItem, type: 'Add'})
        analytics.trackMenuItemClicked(this.props.menuItem, this.props.rowNumber)
    }

    @computed get tag() {
        return getMenuItemCategory(this.props.menuItem)
    }

    render = () => {
        const menuItem = this.props.menuItem
        const isEven = this.props.rowNumber % 2 === 0
        const buttonStyle =
            isEven
                ? { backgroundColor: config.theme.primary.getMedium(0.8) }
                : { backgroundColor: config.theme.primary.getDark(0.8) }

        return (
            <View style={styles.textMenuItem}>
                <View>
                    <TouchableOpacity onPress={this.showModal}>
                        <View style={[styles.button, buttonStyle]}>
                            <View style={[styles.menuItem]}>
                                <T style={styles.title}>
                                    {this.props.menuItem.name}
                                </T>
                                <T style={styles.tag}>
                                    {this.tag}
                                </T>
                            </View>
                            {
                                this.props.showPrice &&
                                    <Price
                                        price={menuItem.price}
                                        style={styles.price}
                                        />
                            }
                        </View>
                    </TouchableOpacity>
                    <MenuItemOrderList
                        menuItem={menuItem}
                        orderStore={this.props.orderStore}
                        />
                </View>
            </View>
        )
    }
}
