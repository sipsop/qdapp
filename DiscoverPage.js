import React, { Component } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { BarMapView } from './BarMapView.js'
import { BarCard } from './BarCard.js'
import { store } from './Store.js'
import { config } from './Config.js'


@observer export class DiscoverPage extends Component {
    /* properties:
        tabChange: (i) => void
    */
    render = () => {
        const barList = store.barList || []
        if (!barList.length)
            return this.renderLoader()

        return <ScrollView style={{flex: 1}}>
            <BarMapView />
            <View style={{flex: 1, marginTop: 10}}>
                <Text style={{marginLeft: 10, fontSize: 20, color: config.theme.primary.medium}}>
                    Nearby Bars
                </Text>
                {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} tabChange={this.props.tabChange} />)}
            </View>
        </ScrollView>
    }

    renderLoader = () =>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
                animating={true}
                color={config.theme.primary.dark}
                size="large"
                />
        </View>
}
