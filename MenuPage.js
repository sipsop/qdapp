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
  TouchableOpacity,
  TouchableHighlight,
  // Slider,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'

// import Carousel from 'react-native-carousel'
import Carousel from 'react-native-carousel-control'
import Slider from 'react-native-slider'
import WheelPicker from 'react-native-picker'

import { SizeTracker } from './SizeTracker.js'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

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
        return <View style={menuItemStyle.menuItemView}>
            <PrimaryMenuItem />
            <ItemSelection size="half-pint" number={2} price={2.60} added={true} />
            <ItemSelection size="pint + lime" number={1} price={3.40} added={true} />
            <ItemSelection size="pint" number={0} price={3.40} added={false} />

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

class ItemSelection extends Component {
    /* properties:
        size: str
            pint, half-pint, shot, double-shot, bottle, etc
        price: float
            price of individual drink
        number: int
            number of drinks
        added: bool
    */
    render = () => {
        // const iconName = this.props.added ? "times" : "plus"
        // const iconColor = this.props.added ? "rgb(145, 47, 16)" : "rgb(16, 145, 17)"
        const total = this.props.price == 0 ? "" : this.props.price * this.props.number

        return <View style={{flex: 0, height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <View style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="minus" size={30} color="#900" />
            </View>
            <TouchableOpacity style={{flex: 3, flexWrap: 'wrap'}}>
                <View style={{flex: 1, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', borderBottomWidth: 1}}>
                    <Text lineBreakMode='tail' numberOfLines={1} style={{flex: 2}}>
                        {this.props.size}
                    </Text>
                    <Text style={{textAlign: 'right'}}>
                        {this.props.number}
                    </Text>
                    <Icon name="sort-down" size={20} style={{marginLeft: 5, marginTop: -5}} />
                </View>
            </TouchableOpacity>
            <Text style={{marginLeft: 10, textAlign: 'right'}}>
                {'£' + total.toFixed(2)}
            </Text>
            <View style={{flex: 0, width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <EvilIcon name="plus" size={30} color="rgb(51, 162, 37)" />
            </View>
            {/*
            <TouchableOpacity style={{width: 40, justifyContent: 'center', alignItems: 'center'}}>
                <Icon name={iconName} size={30} color={iconColor} style={{}} />
            </TouchableOpacity>
            */}
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
        console.log("rendering...")
        return <View style={{flex: 1}}>
            <TouchableOpacity onPress={this.handleToggle.bind(this)}>
                <Text>pint (£3.40)</Text>
            </TouchableOpacity>
            <WheelPicker ref={this.handlePickerBind.bind(this)}
                    pickerData={[ ["pint (£3.40)", "half-pint (£2.60)"]
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
                <Text>£3.60</Text>
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
