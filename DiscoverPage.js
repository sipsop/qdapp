import React, { Component } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import { MapView } from './Maps/MapView.js'
import { BarCard } from './Bar/BarCard.js'
import { DownloadResultView } from './HTTP.js'
import { T } from './AppText.js'
import { store, barStore, mapStore } from './Store.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

const log = _.logger('DiscoverPage.js')

@observer
export class DiscoverPage extends DownloadResultView {
    constructor(props) {
        super(props, "Error downloading list of bars:")
    }

    refreshPage = store.initialize
    getDownloadResult = () => mapStore.getNearbyBarsDownloadResult()
    renderNotStarted  = () => <View />

    renderFinished = searchResponse => {
        const barList = mapStore.nearbyBarList
        return <DiscoverView barList={barList} />
    }
}

@observer
export class DiscoverView extends Page {
    /* properties:
        barList: [schema.Bar]
    */

    saveScrollView = (scrollview) => {
        store.discoverScrollView = scrollview
    }

    renderView = () => {
        const barList = this.props.barList.slice(0, 3)
        log("barLIST>>>>>>>>>", barList)
        return (
            <ScrollView style={{flex: 1}} ref={this.saveScrollView}>
                <MapView />
                {/*
                <View style={{flex: 1}}>
                    <T style={
                            { marginLeft: 10
                            , fontSize: 20
                            , color: config.theme.primary.medium
                            }}>
                        Nearby Bars
                    </T>
                    */}
                {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
                {/*</View>*/}
            </ScrollView>
        )
    }
}
