import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  ListView,
  Picker,
  Modal,
  TouchableOpacity,
  // Slider,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'

// import Carousel from 'react-native-carousel'
import Carousel from 'react-native-carousel-control'
import Slider from 'react-native-slider'
import WheelPicker from 'react-native-picker'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { SizeTracker } from './SizeTracker.js'
import { CustomPicker } from './CustomPicker.js'
import { min, max } from './Curry.js'

export class MenuPage extends SizeTracker {
    /* properties:
        width: int
        height: int
    */

    constructor(props) {
        super(props)
        const { height, width} = Dimensions.get('screen')
        this.state = {width: width, height: height} // approximate width and height
    }

    render() {
        const imageHeight = this.state.height / 2

        return (
            <View>
                <Carousel style={{flex: 1}}>
                    <View style={carouselStyles.container}>
                        <Image source={{uri: beerImg}} style={{width: 400, height: 400}} />
                    </View>
                    <View style={carouselStyles.container}>
                        <Image source={{uri: beerImg}} style={{width: 400, height: 400}} />
                    </View>
                    <View style={carouselStyles.container}>
                        <Image source={{uri: beerImg}} style={{width: 400, height: 400}} />
                    </View>
                </Carousel>
                <View style={{flex: 1}}>
                    <MenuItem />
                </View>
                {/*
                <View style={{flex: 1}}>
                    <ItemPicker />
                </View>
                */}
            </View>
        )
    }
}

// const beerImg = "http://cdn.funcheap.com/wp-content/uploads/2016/06/beer1.jpg"
const beerImg = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

var carouselStyles = StyleSheet.create({
    container: {
        width: 400,
        height: 200,
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'transparent',
        borderWidth: 1,
        margin: 10,
    },
})

class Order {
    constructor(size, top) {
        this.size = size
        this.top  = top
    }
}

class MenuItem extends Component {

    constructor(props) {
        super()
        this.state = { selected: undefined }
    }

    render = () => {
        const sizes = ["pint", "half-pint"]
        const prices = [3.60, 2.40]
        const tops = ["(+top)", "shandy", "lime", "blackcurrant"]
        return <View style={menuItemStyle.menuItemView}>
            <PrimaryMenuItem />
            <DrinkSelection drinkSizes={sizes} drinkPrices={prices} drinkTops={tops} />
            <DrinkSelection drinkSizes={sizes} drinkPrices={prices} drinkTops={tops} />
            <DrinkSelection drinkSizes={sizes} drinkPrices={prices} drinkTops={tops} />
            {/* Picker thing
            <View style={{flex: 1, flexDirection: 'row', height: 50, justifyContent: 'space-between', alignItems: 'center', marginRight: 5, marginLeft: 5}}>
                <View style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                    <EvilIcon name="minus" size={30} color="#900" />
                </View>
                <View style={{flex: 1}}>
                    <Picker selectedValue={this.state.selectedOrder}>
                        <Picker.Item label="pint (£3.60)" value="pint" />
                        <Picker.Item label="half-pint (£2.40)" value="half-pint" />
                    </Picker>
                </View>
                <View style={{flex: 1}}>
                    <Picker>
                        <Picker.Item label="+top" value="add-top" />
                        <Picker.Item label="shandy" value="shandy" />
                        <Picker.Item label="lime" value="lime" />
                        <Picker.Item label="blackcurrant" value="blackcurrant" />
                    </Picker>
                </View>
                <View style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                    <EvilIcon name="plus" size={30} color="rgb(51, 162, 37)" />
                </View>
            </View>
            */}
        </View>
    }
}

class PrimaryMenuItem extends Component {
    render = () => {
        return <View style={menuItemStyle.primaryMenuItemView}>
            <Image source={{uri: beerImg}} style={menuItemStyle.image} />
            <View style={menuItemStyle.contentView}>
                <MenuItemHeader />
            </View>
        </View>
    }
}

class DrinkSelection extends Component {
    /* properties:
        drinkSizes: [str]
            pint, half-pint, shot, double-shot, bottle, etc
        drinkPrices: [float]
            price of drink (corresponding to the drink size)
        drinkTops: [str]
            shandy, lime, blackcurrant, etc
    */
    constructor(props) {
        super(props)
        this.state = {
            currentDrinkSize:   0,
            currentDrinkTop:    0,
            currentNumber:      0,
        }
    }

    handleDecrease = () => {
        this.setState({currentNumber: max(this.state.currentNumber - 1, 0)})
    }

    handleIncrease = () => {
        this.setState({currentNumber: min(this.state.currentNumber + 1, 99)})
    }

    handleDrinkSizeChange = (i) => {
        this.setState({currentDrinkSize: i})
    }

    handleDrinkTopChange = (i) => {
        this.setState({currentDrinkTop: i})
    }

    handleNumberChange = (i) => {
        this.setState({currentNumber: i})
    }

    render = () => {
        const price = this.props.drinkPrices[this.state.currentDrinkSize]
        const total = this.state.currentNumber * price

        const drinkSizesModal =  _.zipWith(
            this.props.drinkSizes,
            this.props.drinkPrices,
            (text, price) => text + ' (£' + price.toFixed(2) + ')'
            )

        const drinkTopsModal = this.props.drinkTops.map(
            (text, i) => text + ' (+£0.00)')

        return <View style={{flex: 0, height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <TouchableOpacity onPress={this.handleDecrease} style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="minus" size={30} color="#900" />
            </TouchableOpacity>
            <CustomPicker
                labels={this.props.drinkSizes}
                modalLabels={drinkSizesModal}
                current={this.state.currentDrinkSize}
                handleItemChange={this.handleDrinkSizeChange}
                />
            <CustomPicker
                labels={this.props.drinkTops}
                modalLabels={drinkTopsModal}
                current={this.state.currentDrinkTop}
                handleItemChange={this.handleDrinkTopChange}
                />
            <CustomPicker
                labels={_.range(100)}
                modalLabels={_.range(100)}
                current={this.state.currentNumber}
                handleItemChange={this.handleNumberChange}
                />
            {/*
            <View style={{flex: 3}}>
                <Picker selectedValue={this.state.selectedOrder}>
                    <Picker.Item label="pint (£3.60)" value="pint" />
                    <Picker.Item label="half-pint (£2.40)" value="half-pint" />
                </Picker>
            </View>
            */}
            {/*
            <TouchableOpacity style={{flex: 1, flexWrap: 'wrap'}}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', borderBottomWidth: 1}}>
                    <Text lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {this.state.size}
                    </Text>
                    <Text style={{textAlign: 'right'}}>
                        {this.state.currentNumber}
                    </Text>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
            */}
            <Text style={{marginLeft: 10, textAlign: 'right'}}>
                {'£' + total.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={this.handleIncrease} style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="plus" size={30} color="rgb(51, 162, 37)" />
            </TouchableOpacity>
         </View>
    }
}

class ItemPicker extends Component {
    constructor(props) {
        super(props)
        this.picker = undefined
    }

    handleToggle = () => {
        this.picker.toggle()
    }

    handlePickerBind = (picker) => {
        console.log("set picker")
        this.picker = picker
    }

    render = () => {
        return <View style={{flex: 1}}>
            <TouchableOpacity onPress={this.handleToggle.bind(this)}>
                <Text>pint (£3.60)</Text>
            </TouchableOpacity>
            <WheelPicker ref={this.handlePickerBind.bind(this)}
                    pickerData={[ ["pint (£3.60)", "half-pint (£2.40)"]
                                , [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
                                , ["no top", "shandy", "lime", "black currant"]
                                ]}
                    selectedValue={["pint", 1, "no-top"]}
                    style={{height: 320}}
                    showDuration={300}
                    />
        </View>
    }
}

class MenuItemHeader extends Component {
    render = () => {
        return <View style={{flex: 0, height: 60, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' }}>
            <View style={{flex: 1, flexWrap: 'wrap'}}>
                <Text lineBreakMode='tail' numberOfLines={1} style={menuItemStyle.titleText}>
                    Guiness
                    {/*Rock Bottom Cask Conditioned Bourbon Chocolate Oatmeal Stout*/}
                </Text>
                <Text style={menuItemStyle.keywordText}>
                    #stout #dry #irish
                </Text>
                <Text style={menuItemStyle.infoText} numberOfLines={1}>
                    Guinness is an Irish dry stout.
                </Text>
            </View>
            <View>
                <Text style={{fontWeight: 'bold'}}>£3.60</Text>
                <TouchableOpacity>
                    <View style={{flex: 0, width: 40, height: 40, justifyContent: 'center', marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
                        <Icon name="heart-o" size={30} color="#900" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
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
