import React, { Component } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import { BarMapView } from './BarMap.js'
import { BarCard } from './BarCard.js'
import { DownloadResultView } from './HTTP.js'
import { T } from './AppText.js'
import { store, barStore } from './Store.js'
import { config } from './Config.js'


@observer
export class DiscoverPage extends DownloadResultView {
    constructor(props) {
        super(props, "Error downloading list of bars:")
    }

    refreshPage = store.initialize
    getDownloadResult = () => barStore.getBarListDownloadResult()
    renderNotStarted  = () => <View />

    saveScrollView = (scrollview) => {
        store.discoverScrollView = scrollview
    }

    renderFinished = (barList) => {
        return <DiscoverView barList={barList} />
    }
}

@observer
export class DiscoverView extends Page {
    /* properties:
        barList: [schema.Bar]
    */
    renderView = () => {
        const barList = this.props.barList
        return (
            <ScrollView style={{flex: 1}} ref={this.saveScrollView}>
                <BarMapView />
                <View style={{flex: 1}}>
                    {/*
                    <T style={
                            { marginLeft: 10
                            , fontSize: 20
                            , color: config.theme.primary.medium
                            }}>
                        Nearby Bars
                    </T>
                    */}
                    {barList.slice(0, 3).map((bar, i) => <BarCard key={i} bar={bar} />)}
                </View>
            </ScrollView>
        )
    }
}
