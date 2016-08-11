import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
} from 'react-native';
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { BarMapView } from './BarMapView.js'
import { BarCard } from './BarCard.js'
import { DownloadResultView } from './HTTP.js'
import { store } from './Store.js'
import { config } from './Config.js'


@observer export class DiscoverPage extends DownloadResultView {
    constructor(props) {
        super(props, "Error downloading list of bars:")
    }

    getDownloadResult = () => store.barList
    renderNotStarted  = () => <View />

    renderFinished = (barList) => {
        return <ScrollView style={{flex: 1}}>
            <BarMapView />
            <View style={{flex: 1, marginTop: 10}}>
                <Text style={
                        { marginLeft: 10
                        , fontSize: 20
                        , color: config.theme.primary.medium
                        }}>
                    Nearby Bars
                </Text>
                {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
            </View>
        </ScrollView>
    }
}
