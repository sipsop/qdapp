import React, { Component } from 'react';
import {
  AppRegistry,
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native';
import Dimensions from 'Dimensions';
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { ImageSwiper } from './ImageSwiper.js'
import { BarMapView } from './BarMapView.js'
import { store } from './Store.js'


@observer export class DiscoverPage extends Component {
    render = () => {
        const barList = store.barList || []
        if (!barList.length)
            return this.renderLoader()

        return <BarMapView>
            {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
        </BarMapView>
    }

    renderLoader = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
                animating={true}
                color="rgb(144, 79, 43)"
                size="large"
                />
        </View>
}

// @observer class Map extends Component {
//     render = () => {
//         return <MapView
//             style={{height: 400, width: 300, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
//             initialRegion={{
//                 latitude: 37.78825,
//                 longitude: -122.4324,
//                 latitudeDelta: 0.0922,
//                 longitudeDelta: 0.0421,
//             }}
//             />
//     }
// }

@observer class BarCard extends Component {
    /* properties:
        bar: schema.Bar
            bar info
    */

    render = () => {
        const bar = this.props.bar
        const viewHeight = 350
        const imageHeight = 250
        const radius = 5

        const imageStyle = {
            flex: 0,
            height: imageHeight,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
        }

        const { height, width } = Dimensions.get('screen')

        const renderImage = (url, i) =>
            <Image key={i} source={{uri: url}} style={imageStyle} />

        return <View style={{flex: 0, height: 350, borderWidth: 1}}>
            <ImageSwiper height={250} showButtons={true} width={width - 20}>
                {bar.images.map(renderImage)}
            </ImageSwiper>
            <BarCardFooter bar={bar} />
        </View>
    }

}

@observer class BarCardFooter extends Component {
    /* properties:
        bar: schema.Bar
    */

    render = () => {
        const bar = this.props.bar

        const footerStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            borderLeftWidth: 1,
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
        }

        return <View style={footerStyle}>
            <Text style={{flex: 1, fontSize: 20}}>{bar.name}</Text>
            <Text style={{flex: 1, textAlign: 'center'}}>{bar.address.city}</Text>
            {/*<Text style={{flex: 1}}>11.00 - 23.30</Text>*/}
        </View>
    }
}
