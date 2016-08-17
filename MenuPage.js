import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  ListView,
  Picker,
  Modal,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import { observable, computed, transaction, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { updateSelection } from './Selection.js'
import { PureComponent } from './Component.js'
import { T } from './AppText.js'
import { Price, sumPrices } from './Price.js'
import { DownloadResultView } from './HTTP.js'
import { SizeTracker } from './SizeTracker.js'
import { PickerCollection, PickerItem } from './Pickers.js'
import { Button } from './Button.js'
import { TagView } from './Tags.js'
import { min, max } from './Curry.js'
import { store } from './Store.js'
import { tagStore } from './Tags.js'


@observer
export class MenuPage extends DownloadResultView {
    /* properties:
    */

    constructor(props) {
        super(props, "Error downloading menu page")
    }

    refreshPage = () => {
        if (store.barID) {
            store.setBarID(store.barID)
        }
    }
    getDownloadResult = () => store.bar

    renderNotStarted = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button
                label="Please select a bar first"
                onPress={() => {store.setCurrentTab(0)}}
                />
        </View>

    renderFinished = (bar) => {
        return <View>
            <TagView />
            <View style={{marginTop: 5}} />
            {
                tagStore.getActiveMenuItems().map(
                    (menuItem, i) => <MenuItem key={i} menuItem={menuItem} />
                )
            }
        </View>
    }
}

const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

@observer
class MenuItem extends PureComponent {
    /* properties:
        menuItem: scheme.MenuItem
    */

    @observable expanded   = false
    @observable orderItems = null

    constructor(props) {
        super(props)
        this.orderItems = []
        this.defaultOrderItem = new OrderItem(props.menuItem)
    }

    isDefaultOrderItem = (orderItem) => {
        const defaultOptions = this.props.menuItem.options.map(getMenuItemDefaultOptions)
        /* force value for comparison ... */
        const selectedOptions = orderItem.selectedOptions.map(
            xs => xs.map(y => y)
        )
        return orderItem.amount === 0 &&
            ( orderItem.selectedOptions.length === 0
           || _.isEqual(selectedOptions, defaultOptions)
            )
    }

    getDefaultOrderItem = () => new OrderItem(this.props.menuItem)

    toggleExpand = () => {
        transaction(() => {
            this.orderItems = this.orderItems.filter(
                orderItem => !this.isDefaultOrderItem(orderItem))
            if (this.orderItems.length === 0) {
                this.expanded = !this.expanded
                if (this.expanded) {
                    this.orderItems.push(this.getDefaultOrderItem())
                }
            }
        })
    }

    render = () => {
        const menuItem = this.props.menuItem
        const image = menuItem.images[0]

        return <View>
            <View style={styles.primaryMenuItemView}>
                <TouchableOpacity onPress={this.toggleExpand}>
                    <Image source={{uri: image}} style={styles.image} />
                </TouchableOpacity>
                <View style={viewStyles.content}>
                    <MenuItemHeader menuItem={menuItem} toggleExpand={this.toggleExpand} />
                </View>
            </View>
            {
                this.orderItems.map((orderItem, i) => {
                    return <OrderSelection
                                key={i}
                                menuItem={menuItem}
                                orderItem={orderItem}
                                />
                })
            }
        </View>
    }
}

class OrderItem {
    @observable amount = 0
    @observable selectedOptions = null

    constructor(menuItem) {
        this.menuItem = menuItem
        // e.g. [[0], [], [1, 3]]
        this.selectedOptions = menuItem.options.map(getMenuItemDefaultOptions)
        this.currency = menuItem.price.currency
    }

    /* Compute the price for all the selected options */
    @computed get subTotal() {
        const allPrices = _.zipWith(this.menuItem.options, this.selectedOptions,
            (menuItemOption, indices) => indices.map(i => menuItemOption.prices[i])
        )
        return sumPrices(_.flatten(allPrices))
    }

    @computed get total() {
        return this.subTotal * this.amount
    }
}

/* getDefaultOptions : [schema.MenuItemOption] -> [Int] */
const getMenuItemDefaultOptions = (menuItemOption) => {
    return updateSelection(menuItemOption.optionType, [], menuItemOption.defaultOption)
}

@observer
class MenuItemHeader extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        toggleExpand() -> void
            callback to invoke when click the text area
    */
    render = () => {
        const menuItem = this.props.menuItem
        return <View style={viewStyles.header}>
            <View style={viewStyles.titleAndPrice}>
                <ScrollView horizontal={true} style={styles.titleScrollView}>
                    <T
                        lineBreakMode='tail'
                        numberOfLines={1}
                        style={styles.titleText}
                        >
                        {menuItem.name}
                    </T>
                </ScrollView>
                <Price price={menuItem.price} style={styles.priceText} />
            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity style={{flex: 1}} onPress={this.props.toggleExpand}>
                    <View style={{flex: 1}}>
                        <T style={styles.keywordText}>
                            {   _.join(
                                    menuItem.tags.map(tagID => '#' + tagStore.getTagName(tagID)),
                                    ' '
                                )
                            }
                        </T>
                        <T style={styles.infoText} numberOfLines={3}>
                            {menuItem.desc}
                        </T>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <View style={viewStyles.favIcon}>
                        <Icon name="heart-o" size={45} color="#900" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    }
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
        /*
        flex: 1,
        width: undefined,
        height: undefined,
        */
        // minWidth: 100,
        // minHeight: 100,
        width:  100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    titleScrollView: {
        marginRight: 10,
    },
    titleText: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textDecorationLine: 'underline',
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

const N = 300
const iconBoxSize = 50
const iconSize = 45

@observer
export class OrderSelection extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        orderItem: schema.OrderItem
    */

    @observable optionPickerItems = null
    @observable amountPickerItem = null

    constructor(props) {
        super(props)
        autorun(() => {
            transaction(() => {
                const orderItem = props.orderItem
                var   subTotal = orderItem.subTotal
                if (!subTotal)
                    subTotal = 0.0
                this.amountPickerItem = new PickerItem(
                    "Number of Drinks:",
                    _.range(N).map(i => "" + i),
                    _.range(N).map(i => this.makeAbsPrice(i * subTotal)),
                    -1,                             /* defaultOption */
                    [props.orderItem.amount || 0],  /* selection */
                    'Single',                       /* optionType */
                )
            })
        })
    }

    makeAbsPrice = (price) => {
        return {
            price: price,
            option: 'Absolute',
            currency: this.props.orderItem.currency,
        }
    }

    handleIncrease = () => {
        this.props.orderItem.amount = min(50, this.props.orderItem.amount + 1)
    }

    handleDecrease = () => {
        this.props.orderItem.amount = max(0, this.props.orderItem.amount - 1)
    }

    handleAcceptAmountChanges = (pickerItems) => {
        this.props.orderItem.amount = pickerItems[0].selected[0]
    }

    render = () => {
        const orderItem = this.props.orderItem
        const subTotal = orderItem.subTotal

        const amountPickerItems = this.amountPickerItem
            ? [this.amountPickerItem]
            : []

        return <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="minus" size={iconSize} color="#900" />
            </TouchableOpacity>
            {/*
            <PickerCollection
                pickerItems={[this.sizeItem, this.topsItem]}
                handleItemChanges={[this.handleDrinkSizeChange, this.handleDrinkTopChange]}
                initialSelection={[this.currentDrinkSize, this.currentDrinkTop]}
                wheelPicker={true}
                />
            */}
            <PickerCollection
                pickerItems={amountPickerItems}
                onAcceptChanges={this.handleAcceptAmountChanges}
                />
            <T style={{marginLeft: 10, textAlign: 'right'}}>
                {'£' + orderItem.total.toFixed(2)}
            </T>
            <TouchableOpacity
                    onPress={this.handleIncrease}
                    style={{flex: 0, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}
                    >
                <EvilIcon name="plus" size={iconSize} color="rgb(51, 162, 37)" />
            </TouchableOpacity>
         </View>
    }
}
