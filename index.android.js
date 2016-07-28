/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
} from 'react-native';
import Dimensions from 'Dimensions';
import _ from 'lodash'
import Swiper from 'react-native-swiper'

import { Menu, SampleMenu } from './Menu.js'

class Images extends Component {
    /* properties:
        height: int
    */
    render = () => {
        const height = this.props.height
        const outsideURL = "http://blog.laterooms.com/wp-content/uploads/2014/01/The-Eagle-Cambridge.jpg"
        const insideURL = "http://www.vintagewings.ca/Portals/0/Vintage_Stories/News%20Stories%20L/EaglePubRedux/Eagle14.jpg"
        return <ImageSwiper showsButtons={true} height={height}>
            <Image source={{uri: outsideURL}} style={{flex: 1, height: height}} />
            <Image source={{uri: insideURL}} style={{flex: 1, height: height}} />
        </Swiper>
    }
}

const dotStyles = StyleSheet.create({
    dotStyle: {
        backgroundColor:'rgba(0,0,0,.2)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    },
    activeDotStyle: {
        backgroundColor: '#007aff',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 3,
        marginRight: 3,
        marginTop: 3,
        marginBottom: 3,
    }
})

class ImageSlider extends Component {
    /* properties:
        height: int
        showsButtons: bool
        children: [Image]
    */

    render = () => {
        const dot = <View style={dotStyles.dotStyle} />
        const activeDot = <View style={dotStyles.activeDotStyle} />
        return <Swiper showsButtons={this.props.showsButtons}
                       height={this.props.height}
                       dot={dot}
                       activeDot={activeDot}
                       />
            {this.props.children}
        </Swiper>
    }
}

class Main extends Component {

    constructor(props) {
        super(props)
        const { height, width} = Dimensions.get('screen')
        this.state = {width: width, height: height} // approximate width and height
    }

    handleLayoutChange = (event) => {
        const { height, width} = event.nativeEvent.layout
        this.setState({width: width, height: height})
    }

    render() {
        const imageHeight = this.state.height / 2

        // TODO: make bar images swipable
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <ScrollView style={{flex: 1}} onLayout={this.handleLayoutChange}>
                    <Images height={imageHeight} />
                    <View style={contentStyle.title}>
                        <Text style={barTitleStyle.barTitleText}>
                            The Eagle
                        </Text>
                    </View>
                    <View style={contentStyle.menu}>
                        <Text style={contentStyle.menuText}>Menu</Text>
                    </View>
                    <SampleMenu />
                </ScrollView>
            </View>
        )

        // return (
        //     <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch'}}>
        //         <ScrollView style={{flex: 1}}>
        //             <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch'}}>
        //                 <Image source={{uri: url}} style={{flex: 1, alignSelf: 'stretch', resizeMode: 'contain'}} />
        //                 <Image source={{uri: url}} style={{flex: 1, alignSelf: 'stretch', resizeMode: 'contain'}} />
        //             </View>
        //         </ScrollView>
        //     </View>
        // )
    }
}

const contentStyle = StyleSheet.create({
    main: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#D7CCC8',
    },
    picture: {
        flex: 1,
        flexDirection: 'row',
        height: 400,
    },
    title: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50, // TODO: remove
        backgroundColor: "#B0BEC5",
    },
    fill: {
        flex: 1,
    },
    menu: {
        flexDirection:  'row',
        justifyContent: 'center',
        marginTop:      20,
    },
    menuText: {
        fontSize: 18,
    },
});

const barImageStyle = StyleSheet.create({
    barImage: {
        flex: 1,
        flexDirection: 'row',
    }
})

const barTitleStyle = StyleSheet.create({
    // children
    barTitleText: {
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    barTitleInfo: {
        flex: 1,
        fontSize: 15,
        textAlign: 'center',
        margin: 10,
    },
});

AppRegistry.registerComponent('AwesomeProject', () => Main);

// Testing

class ListViewBasics extends Component { // Initialize the hardcoded data
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            dataSource: ds.cloneWithRows(_.range(100))
        };
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    {_.range(100).map((i) => <Text key={i}>{i}</Text>)}
                </ScrollView>
            </View>
        )
        return (
            <View style = {{paddingTop: 22, flex: 1}}>
                <ListView dataSource={this.state.dataSource}
                          renderRow={(rowData) => <Text>{rowData}</Text>}
                          />
            </View>
        )
    }
}

// AppRegistry.registerComponent('AwesomeProject', () => ListViewBasics);

class JustifyContentBasics extends Component {
    render() {
        return (
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'stretch',
            }}>
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'powderblue'}} />
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'skyblue'}} />
                <View style={{width: 50, /*height: 50,*/ backgroundColor: 'steelblue'}} />
            </View>
        );
    }
};

// AppRegistry.registerComponent('AwesomeProject', () => JustifyContentBasics);
