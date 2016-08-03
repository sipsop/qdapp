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
  // Slider,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'

// import Carousel from 'react-native-carousel'
import Carousel from 'react-native-carousel-control'
import Slider from 'react-native-slider'

import { SizeTracker } from './SizeTracker.js'
import Icon from 'react-native-vector-icons/FontAwesome';

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


class MenuItem extends Component {

    constructor(props) {
        super()
        this.state = {expanded: false}
    }

    render = () => {
        return <View style={menuItemStyle.menuItemView}>
            <PrimaryMenuItem />
        </View>
    }
}

class PrimaryMenuItem extends Component {
    render = () => {
        return <View style={menuItemStyle.primaryMenuItemView}>
            <Image source={{uri: beerImg}} style={menuItemStyle.image} />
            <View style={menuItemStyle.contentView}>
                <View style={{flex: 5, flexWrap: 'wrap'}}>
                    <Text lineBreakMode='tail' numberOfLines={2} style={menuItemStyle.titleText}>
                        Guiness
                        {/*Rock Bottom Cask Conditioned Bourbon Chocolate Oatmeal Stout*/}
                    </Text>
                    <Text style={menuItemStyle.keywordText}>
                        #stout #dry #irish
                    </Text>
                    <Text style={menuItemStyle.infoText} numberOfLines={5}>
                        Guinness is an Irish dry stout.
                    </Text>
                    <View style={{flex:1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Picker selectedValue={"pint"} style={{flex: 1}}>
                            <Picker.Item value="pint" label="pint" />
                            <Picker.Item value="half-pint" label="half-pint" />
                        </Picker>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 10}}>
                            <Icon name="minus-square-o" size={20} style={{marginLeft: 5}} color="#900" />
                            <TextInput
                                style={{marginLeft: 5, textAlign: 'center'}}
                                placeholder="0"
                                />
                            <Icon name="plus-square-o" size={20} style={{marginLeft: 5}} color="rgb(16, 145, 17)" />
                        </View>
                        <Text style={{textAlign: 'right'}}>£0</Text>
                     </View>
                </View>
                <View style={{flex: 2, alignItems: 'center'}}>
                    <Icon name="heart-o" size={30} color="#900" style={{marginTop: 15}} />
                </View>
            </View>
        </View>
    }
}

class MenuItemHeader extends Component {
    render = () => {
        return <View style={{flex: 5, flexWrap: 'wrap'}}>
            <Text lineBreakMode='tail' numberOfLines={2} style={menuItemStyle.titleText}>
                Guiness
                {/*Rock Bottom Cask Conditioned Bourbon Chocolate Oatmeal Stout*/}
            </Text>
            <Text style={menuItemStyle.keywordText}>
                #stout #dry #irish
            </Text>
            <Text style={menuItemStyle.infoText} numberOfLines={5}>
                Guinness is an Irish dry stout.
            </Text>
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
        height:             100,
    },
    primaryMenuItemView: {
        flex:           0,
        flexDirection:  'row',
        justifyContent: 'flex-start',
        alignItems:     'flex-start',
        height:         100,
    },
    image: {
        /*
        flex: 1,
        width: undefined,
        height: undefined,
        */
        // minWidth: 100,
        // minHeight: 100,
        width: 100,
        height: 100,
        // borderRadius: 10,
    },
    contentView: {
        flex:           1,
        flexDirection:  'row',
        height:         100,
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

class Selection extends Component {
    render = () => {
        return <View style={{flex: 1}}>
            <SelectionItem name="pint" />
            <SelectionItem name="half-pint" />
        </View>
    }
}

class SelectionItem extends Component {
    /* properties:
        name: str
    */
    render = () => {
        return <View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                <Text style={{width: 80, textAlign: 'center', fontSize: 14}}>2 {this.props.name}</Text>
                <View style={{flex: 4, flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize: 30, textAlign: 'center', marginLeft: 5, marginRight: 5}}>-</Text>
                    <Slider style={{flex: 3, height: 50}}
                            value={0}
                            minimumValue={0}
                            maximumValue={20}
                            minimumTrackTintColor='#1fb28a'
                            maximumTrackTintColor='#d3d3d3'
                            thumbTintColor='#1a9274'
                            trackStyle={{height: 10}}
                            thumbStyle={{height: 20}}
                            />
                        <Text style={{fontSize: 30, textAlign: 'center', marginLeft: 5, marginRight: 5}}>+</Text>
                </View>
                <Text style={{flex: 1, textAlign: 'center'}}>price</Text>
            </View>
        </View>
    }
}

const selectionItemStyle = StyleSheet.create({
    selectionItemView: {
        // flex:           1,
        flexDirection:  'row',
        // justifyContent: 'space-between',
        // alignItems:     'center',
        // marginTop:      20,
    },
})
