import { React, Component, PureComponent, View, TouchableOpacity, Icon, StyleSheet } from '/components/Component.js'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('/components/TabView')

const styles = StyleSheet.create({
    tabStyle: {
        flex: 1,
    },
    tabBarTextStyle: {
        marginTop: 4,
        fontSize: 16,
        textAlign: 'center',
    },
    tabBarUnderlineStyle: {
        backgroundColor: config.theme.primary.medium,
    },
})

export class TabView extends PureComponent {
    /* properties:
        ...props: passed directly to ScrollableTabView
    */
    render = () => {
        return (
            <ScrollableTabView
                ref={this.props.getRef}
                style={styles.tabStyle}
                scrollWithoutAnimation={true}
                tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
                tabBarActiveTextColor={config.theme.primary.medium}
                tabBarTextStyle={styles.tabBarTextStyle}
                {...this.props}
                >
                {this.props.children}
            </ScrollableTabView>
        )
    }
}
