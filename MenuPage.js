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
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { T } from './AppText.js'
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
            {
                tagStore.getActiveMenuItems().map(
                    (menuItem, i) => <MenuItem key={i} item={menuItem} />
                )
            }
        </View>
    }
}

const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

@observer
class MenuItem extends Component {
    /* properties:
        item: scheme.MenuItem
    */

    render = () => {
        // const sizes = ["pint", "half-pint"]
        // const prices = [3.60, 2.40]
        // const tops = ["(+top)", "shandy", "lime", "blackcurrant"]
        const item = this.props.item
        const image = item.images[0]

        return <View style={menuItemStyle.menuItemView}>
            <View style={menuItemStyle.primaryMenuItemView}>
                <Image source={{uri: image}} style={menuItemStyle.image} />
                <View style={menuItemStyle.contentView}>
                    <MenuItemHeader item={item} />
                </View>
            </View>
            {/*
            <DrinkSelection drinkSizes={sizes} drinkPrices={prices} drinkTops={tops} drinkTopPrices={[0, 0, 0, 0]} />
            */}
        </View>
    }
}

export class DrinkSelection extends Component {
    /* properties:
        drinkSizes: [str]
            pint, half-pint, shot, double-shot, bottle, etc
        drinkPrices: [float]
            price of drink (corresponding to the drink size)
        drinkTops: [str]
            shandy, lime, blackcurrant, etc
        drinkTopPrices: [float]
            price to add for top
    */

    @observable sizeItem = new PickerItem("Pick a Size:", null, null, 0)
    @observable topsItem = new PickerItem("Pick a Size:", null, null, 0)
    @observable numberItem = new PickerItem("Number of Drinks:", null, null, 0)

    constructor(props) {
        super(props)
        this.sizeItem.labels = this.props.drinkSizes
        this.sizeItem.modalLabels = _.zipWith(
                this.props.drinkSizes,
                this.props.drinkPrices,
                (text, price) => text + ' (£' + price.toFixed(2) + ')'
            )

        // this.topsItem.labels = this.props.drinkTops
        // this.topsItem.modalLabels = this.props.drinkTops.map(
        //         (text, i) => text + ' (+£0.00)'

        // this.number

        this.sizeItem = {
            title:          'Pick a Size:',
            labels:         this.props.drinkSizes,
            modalLabels:    _.zipWith(
                this.props.drinkSizes,
                this.props.drinkPrices,
                (text, price) => text + ' (£' + price.toFixed(2) + ')'
            ),
            initial:        [this.currentDrinkSize, this.currentDrinkTop]
        }

        this.topsItem = {
            title:          'Pick a Top:',
            labels:         this.props.drinkTops,
            modalLabels:    this.props.drinkTops.map(
                (text, i) => text + ' (+£0.00)'
            ),
        }

        const numberItem = {
            title:          'Number of Drinks:',
            labels:         _.range(5),
            modalLabels:    _.range(5),
        }
    }

    handleDecrease = () => {
        this.currentNumber = max(this.currentNumber - 1, 0)
    }

    handleIncrease = () => {
        this.currentNumber = min(this.currentNumber + 1, 99)
    }

    handleDrinkSizeChange = (i) => {
        this.currentDrinkSize = i
    }

    handleDrinkTopChange = (i) => {
        this.currentDrinkTop = i
    }

    handleNumberChange = (i) => {
        this.currentNumber = i
    }

    @computed get price() {
        const drinkPrice = this.props.drinkPrices[this.currentDrinkSize]
        const topPrice = this.props.drinkTopPrices[this.currentDrinkTop]
        return drinkPrice + topPrice
    }

    @computed get total() {
        return this.price * this.currentNumber
    }

    render = () => {
        const price = this.price

        return <View style={{flex: 0, height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="minus" size={30} color="#900" />
            </TouchableOpacity>
            {/*
            <PickerCollection
                pickerItems={[this.sizeItem, this.topsItem]}
                handleItemChanges={[this.handleDrinkSizeChange, this.handleDrinkTopChange]}
                initialSelection={[this.currentDrinkSize, this.currentDrinkTop]}
                wheelPicker={true}
                />
            <PickerCollection
                pickerItems={[this.numberItem]}
                handleItemChanges={[this.handleNumberChange]}
                initialSelection={[this.currentNumber]}
                wheelPicker={false}
                />
            */}
            <T style={{marginLeft: 10, textAlign: 'right'}}>
                {'£' + this.total.toFixed(2)}
            </T>
            <TouchableOpacity onPress={this.handleIncrease} style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="plus" size={30} color="rgb(51, 162, 37)" />
            </TouchableOpacity>
         </View>
    }
}

class MenuItemHeader extends Component {
    /* properties:
        item: schema.MenuItem
    */
    render = () => {
        const item = this.props.item
        return <View style={{flex: 0, height: 60, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' }}>
            <View style={{flex: 1, flexWrap: 'wrap'}}>
                <T lineBreakMode='tail' numberOfLines={1} style={menuItemStyle.titleText}>
                    {item.name}
                    {/*Rock Bottom Cask Conditioned Bourbon Chocolate Oatmeal Stout*/}
                </T>
                <T style={menuItemStyle.keywordText}>
                    {   _.join(
                            item.tags.map(tagID => tagStore.getTagName(tagID)),
                            ' '
                        )
                    }
                </T>
                <T style={menuItemStyle.infoText} numberOfLines={1}>
                    {item.desc}
                </T>
            </View>
            <View>
                <Price price={item.price} style={{fontWeight: 'bold'}} />
                <TouchableOpacity>
                    <View style={{flex: 0, width: 40, height: 40, justifyContent: 'center', marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
                        <Icon name="heart-o" size={30} color="#900" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    }
}

@observer
class Price extends Component {
    /* properties:
        price: schema.Price
    */
    render = () => {
        const price = this.props.price
        var prefix = ""
        if (price.option == 'Relative') {
            if (price.price == 0.0) {
                return <T />
            } else if (price.price < 0) {
                prefix = "- "
            } else {
                prefix = "+ "
            }
        }

        return <T style={this.props.style}>
            {prefix}{this.getCurrencySymbol(price.currency)}{price.price.toFixed(2)}
        </T>
    }

    getCurrencySymbol = (symbol) => {
            if (symbol == 'Sterling') {
                return '£'
            } else if (symbol == 'Euros') {
                return '€'
            } else if (symbol == 'Dollars') {
                return '$'
            } else {
                throw Error('Unknown currency symbol:' + symbol)
            }
    }
}

const menuItemStyle = StyleSheet.create({
    menuItemView: {
        // flexDirection:  'column',
        // justifyContent: 'flex-start',
        // alignItems:     'flex-start',
        // margin:         10,
        // borderRadius:   10,
        flex:               0,
        borderWidth:        1,
        minHeight:             120,
    },
    primaryMenuItemView: {
        flex:           0,
        flexDirection:  'row',
        justifyContent: 'flex-start',
        // alignItems:     'flex-start',
        alignItems:     'flex-start',
        minHeight:      120,
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
    contentView: {
        flex:           1,
        flexWrap: 'wrap',
        // minHeight:      100,
        marginTop:      5,
        marginLeft:     5,
        marginRight:    5,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        fontWeight: "bold",
        borderBottomWidth: 1,
    },
    priceView: {
        flex:           1,
        flexDirection:  'row',
        justifyContent: 'flex-start',
        alignItems:     'flex-end',
    },
    priceText: {
        // flex: 1,
        fontSize: 14,
        fontWeight: "bold",
    },
    infoText: {
        fontSize: 12,
    },
    keywordText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.40)',
    },
})
