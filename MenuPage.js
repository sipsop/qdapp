import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'

// import Carousel from 'react-native-carousel'
import Carousel from 'react-native-carousel-control'

import { SizeTracker } from './SizeTracker.js'

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
            <Selection />
        </View>
    }
}

class PrimaryMenuItem extends Component {
    render = () => {
        return <View style={menuItemStyle.primaryMenuItemView}>
            <Image source={{uri: beerImg}} style={menuItemStyle.image} />
            <View style={menuItemStyle.contentView}>
                <View style={{height: 50}}>
                    <Text style={menuItemStyle.titleText}>Guiness</Text>
                    <Text style={menuItemStyle.keywordText}>
                        #stout #dry #irish
                    </Text>
                    <Text style={menuItemStyle.infoText}>
                        Guinness is an Irish dry stout.
                    </Text>
                </View>
                <View style={{height: 50, justifyContent: 'flex-end'}}>
                    <Prices />
                </View>
            </View>
        </View>
    }
}

class Prices extends Component {
    render = () => {
        return <View style={menuItemStyle.priceView}>
            <Text style={menuItemStyle.priceText}>£3.40</Text>
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
        // borderWidth:    1,
        height: 100,
    },
    primaryMenuItemView: {
        flexDirection: 'row',
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
        height:         100,
        marginLeft:     10,
        marginRight:    10,
        marginTop:      0,
        marginBottom:   0,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        fontWeight: "bold",
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
            <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                <Text style={{flex: 1}}>{this.props.name}</Text>
                <Text style={{flex: 1}}>some text here</Text>
            </View>
            {/*
            <View style={selectionItemStyle.removeItemView}>
                <Text>-</Text>
            </View>
            <View style={selectionItemStyle.textFieldView}>
                <Text>{this.props.name}</Text>
            </View>
            <View style={selectionItemStyle.addItemView}>
                <Text>+</Text>
            </View>
            */}
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
    removeItemView: {
        flex: 1,
    },
    textFieldView: {
        flex: 2,
    },
    addItemView: {
        flex: 1,
    },
})
