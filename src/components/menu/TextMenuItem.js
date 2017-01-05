import { React, Component, View, TouchableOpacity, PureComponent, Img, StyleSheet, T, } from '/components/Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { MenuItemOrderList } from './MenuItemOrderList'
import { MenuItemImage, getMenuItemImage } from './MenuItemImage'
import { BackButton } from '../BackButton'
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
    menuItem: {
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginLeft: 5,
        marginRight: 5,
        paddingLeft: 5,
        paddingRight: 5,
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
        const menuItemStyle =
            this.props.isEven
                ? { backgroundColor: config.theme.primary.getDark(0.7) }
                : { backgroundColor: config.theme.primary.getMedium(0.7) }

        return (
            <View style={styles.textMenuItem}>
                <View>
                    <TouchableOpacity onPress={this.showModal}>
                        <View style={[styles.menuItem, menuItemStyle]}>
                            <T style={styles.title}>
                                {this.props.menuItem.name}
                            </T>
                            <T style={styles.tag}>
                                {this.tag}
                            </T>
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
