/* @flow */

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
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { BarPageFetcher } from './BarPage.js'
import { updateSelection } from './Selection.js'
import { PureComponent } from './Component.js'
import { T } from './AppText.js'
import { Price, sumPrices } from './Price.js'
import { DownloadResultView } from './HTTP.js'
import { SizeTracker } from './SizeTracker.js'
import { PickerCollection, PickerItem } from './Pickers.js'
import { LargeButton } from './Button.js'
import { TagView } from './Tags.js'
import { min, max } from './Curry.js'
import { store } from './Store.js'
import { tagStore } from './Tags.js'
import { size } from './Size.js'
import { config } from './Config.js'

@observer
export class MenuPage extends BarPageFetcher {
    renderFinished = (bar) => {
        return <ScrollView>
            <TagView>
                <View style={{flex: 1, marginTop: 5}}>
                    {
                        tagStore.getActiveMenuItems().map(
                            (menuItem, i) => <MenuItem key={i} menuItem={menuItem} />
                        )
                    }
                </View>
            </TagView>
        </ScrollView>
    }
}

const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

@observer
class MenuItem extends PureComponent {
    /* properties:
        menuItem: scheme.MenuItem
    */

    @observable orderItems = null

    constructor(props) {
        super(props)
        this.orderItems = []
        this.defaultOrderItem = new OrderItem(props.menuItem)
    }

    hasDefaultOptions = (orderItem) => {
        return this.hasSameOptions(this.defaultOrderItem, orderItem)
    }

    hasSameOptions = (orderItem1, orderItem2) => {
        const options1 = orderItem1.selectedOptions.map(xs => xs.map(x => x))
        const options2 = orderItem2.selectedOptions.map(xs => xs.map(x => x))
        return _.isEqual(options1, options2)
    }

    getDefaultOrderItem = () : OrderItem => new OrderItem(this.props.menuItem)

    toggleExpand = () : void => {
        transaction(() => {
            // store.haveNotifiedAboutCustomization = true
            if (this.orderItems.length === 0) {
                this.addRow()
            }
        })
    }

    addRow = () : void => {
        this.orderItems.push(this.getDefaultOrderItem())
    }

    removeRow = (i : number) : void => {
         this.orderItems.splice(i, 1)
    }

    /* If row `i` has the same options as row `j`, remove row `i`. */
    removeRowIfSameOptions = (i : number, j : number) : void => {
        if (this.orderItems.length > 1 &&
                this.hasSameOptions(this.orderItems[i], this.orderItems[j]))
            this.orderItems.splice(i, 1)
    }

    popRow = () : void => {
        this.orderItems.pop()
    }

    render = () => {
        const menuItem = this.props.menuItem
        const image = menuItem.images[0]

        const rowStyle =
            { flex: 1
            , justifyContent: 'center'
            , alignItems: 'center'
            , height: rowHeight
            }

        const buttonStyle =
            { borderRadius: 5
            , borderWidth: 1
            , marginLeft: 5
            , marginRight: 5
            }

        return <View>
            <TouchableOpacity onPress={this.toggleExpand}>
                <View style={styles.primaryMenuItemView}>
                    <Image source={{uri: image}} style={styles.image} />
                    <View style={viewStyles.content}>
                        <MenuItemHeader menuItem={menuItem} toggleExpand={this.toggleExpand} />
                    </View>
                </View>
            </TouchableOpacity>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    {
                        this.orderItems.map((orderItem, i) => {
                            return <OrderSelection
                                        key={i}
                                        rowNumber={i}
                                        menuItem={menuItem}
                                        orderItems={this.orderItems}
                                        removeRow={() => this.removeRow(i)}
                                        removeRowIfSameOptions={() => this.removeRowIfSameOptions(i, i-1)}
                                        />
                        })
                    }
                </View>
                <View>
                    {
                        this.orderItems.map((orderItem, i) => {
                            return (
                                <View key={i} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <T style={{marginRight: 5, color: '#000'}}>
                                        {'£' + orderItem.total.toFixed(2)}
                                    </T>
                                </View>
                            )
                        })
                    }
                </View>
            </View>
            {
                this.orderItems.length === 0
                    ? undefined
                    : <View style={[rowStyle, {flexDirection: 'row', marginBottom: 20}]}>
                        {/*
                        <TouchableOpacity style={{flex: 1}} onPress={this.popRow}>
                            <View style={[rowStyle, buttonStyle, {borderColor: RemoveColor}]}>
                                <T style={{fontSize: 20, color: RemoveColor}}>
                                    REMOVE ROW
                                </T>
                            </View>
                        </TouchableOpacity>
                        */}
                        <TouchableOpacity style={{flex: 1}} onPress={this.addRow}>
                            <View style={[rowStyle, buttonStyle, {borderColor: AddColor}]}>
                                <T style={{fontSize: 20, color: AddColor}}>
                                    MORE OPTIONS
                                </T>
                            </View>
                        </TouchableOpacity>
                    </View>
            }
        </View>
    }
}

class OrderItem {
    @observable amount:number = 1
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

/* getMenuItemDefaultOptions : [schema.MenuItemOption] -> [Int] */
const getMenuItemDefaultOptions = (menuItemOption) => {
    if (menuItemOption.defaultOption == undefined)
        return []
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
                <TouchableOpacity>
                    <View style={viewStyles.favIcon}>
                        <Icon name="heart-o" size={45} color={config.theme.primary.medium} />
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

const N = 50
const rowHeight = 55
const buttonHeight = 45
const iconBoxSize = 60
const iconSize = iconBoxSize
const RemoveColor = '#900'
const AddColor = 'rgb(51, 162, 37)'

@observer
export class OrderSelection extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        orderItems: [schema.OrderItem]
        rowNumber: int
        removeRow() -> void
            remove this row
        removeRowIfSameOptions() -> void
            remove the row iff it has the same options as the item before it
    */

    constructor(props) {
        super(props)
        this.initialOrderItem = this.props.orderItems[this.props.rowNumber]
    }

    @computed get orderItem() {
        if (this.props.rowNumber < this.props.orderItems.length)
            return this.props.orderItems[this.props.rowNumber]
        // Some OrderItem has been removed, but the component will still
        // be rendered until the parent is re-rendered. Stick with the initial
        // OrderItem for now.
        //
        // TODO: Why is the parent not re-rendered first?
        //
        return this.initialOrderItem
    }

    @computed get amountPickerItem() {
        const subTotal = this.orderItem.subTotal || 0.0
        return new PickerItem(
            "Number of Drinks:",
            _.range(N+1).map(i => "" + i),
            _.range(N+1).map(i => this.makeAbsPrice(i * subTotal)),
            -1,                             /* defaultOption */
            [this.orderItem.amount],             /* selection */
            'Single',                       /* optionType */
        )
    }

    @computed get optionPickerItems() {
        const menuItem = this.props.menuItem
        return menuItem.options.map((menuOptionItem, i) => {
            return new PickerItem(
                menuOptionItem.name,
                menuOptionItem.optionList,
                menuOptionItem.prices,
                menuOptionItem.defaultOption || -1,
                this.orderItem.selectedOptions[i],
                menuOptionItem.optionType,
            )
        })
    }

    makeAbsPrice = (price) => {
        return {
            price: price,
            option: 'Absolute',
            currency: this.orderItem.currency,
        }
    }

    @action handleIncrease = () => {
        this.orderItem.amount = min(N, this.orderItem.amount + 1)
    }

    @action handleDecrease = () => {
        if (this.orderItem.amount === 0)
            this.props.removeRow()
        else
            this.orderItem.amount = max(0, this.orderItem.amount - 1)
    }

    @action handleAcceptAmountChanges = (allSelectedOptions : [[number]]) => {
        const amountSelection : [number] = allSelectedOptions[0]
        this.orderItem.amount = amountSelection[0]
    }

    @action handleAcceptOptions = (allSelectedOptions : [[number]]) => {
        this.orderItem.selectedOptions = allSelectedOptions
    }

    render = () => {
        return <View style={
                    { flex: 0
                    , flexDirection: 'row'
                    , justifyContent: 'flex-start'
                    , alignItems: 'center'
                    , height: rowHeight
                    // , marginBottom: 20
                    }
                }>
            <View style={{flex: 2, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={this.optionPickerItems}
                    onAcceptChanges={this.handleAcceptOptions}
                    rowNumber={this.props.rowNumber}
                    showModal={true}
                    onFirstAccept={this.props.removeRowIfSameOptions}
                    onFirstCancel={this.props.removeRow}
                    />
            </View>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, height: iconBoxSize, width: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}>
                {/*<Icon name="minus-circle" size={iconSize} color="#900" />*/}
                <EvilIcon name="minus" size={iconSize} color={RemoveColor} />
            </TouchableOpacity>
            <View style={{flex: 1, height: buttonHeight}}>
                <PickerCollection
                    pickerItems={[this.amountPickerItem]}
                    onAcceptChanges={this.handleAcceptAmountChanges}
                    rowNumber={this.props.rowNumber}
                    />
            </View>
            <TouchableOpacity
                    onPress={this.handleIncrease}
                    style={{flex: 0, width: iconBoxSize, height: iconBoxSize, justifyContent: 'center', alignItems: 'center'}}
                    >
                {/*<Icon name="plus-circle" size={iconSize} color="rgb(51, 162, 37)" />*/}
                <EvilIcon name="plus" size={iconSize} color={AddColor} />
            </TouchableOpacity>
         </View>
    }
}
