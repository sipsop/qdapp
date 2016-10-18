// TODO: Enable flow type checking

import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
} from '../Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { Page } from '../Page.js'
import { DownloadResultView } from '../HTTP.js'
import { OrderList } from '../Orders/OrderList.js'
import { LargeButton } from '../Button.js'
import { TagView } from '../Tags.js'
import { store, tabStore, barStore, tagStore, orderStore } from '../Store.js'
import { analytics } from '../Analytics.js'
import { config } from '../Config.js'
import * as _ from '../Curry.js'

/*********************************************************************/

import type { Int, String } from '../Types.js'
import type { OrderItem } from './Orders/OrderStore.js'

/*********************************************************************/

const { log, assert } = _.utils('./Menu/MenuPage.js')

const rowHeight = 55

@observer
export class MenuPage extends DownloadResultView {
    errorMessage = "Error downloading bar and menu info"
    refreshPage = () => barStore.refreshBar()
    getDownloadResult = () => barStore.getBarAndMenuDownloadResult()
    renderFinished = (bar) => <MenuView />
}

@observer
export class MenuView extends Page {
    renderView = () => {
        return <View style={{flex: 1}}>
            <View style={{flex: 1, marginTop: 5}}>
                <MenuList />
            </View>
            <ReviewButton />
        </View>
    }
}

@observer
class MenuList extends PureComponent {

    handleRefresh = async () => {
        await Promise.all([
            barStore.updateMenuInfo(barStore.barID, force = true),
            tagStore.fetchTags(restartDownload = false, force = true),
        ])
    }

    render = () => {
        {/*
            NOTE: Pass a key to OrderList to ensure it does not
                  reuse state. This has the effect of "reloading"
                  the entire listview. Otherwise, if the user has
                  scrolled down say 100 items, then switching from
                  e.g. wine to beer will render 100 beer items, even
                  though only a few are visible.
        */}
        return <OrderList
                    key={tagStore.tagSelection.join(';')}
                    orderStore={orderStore}
                    menuItems={tagStore.activeMenuItems}
                    /* menuItems={barStore.allMenuItems} */
                    renderHeader={() => <TagView />}
                    onRefresh={this.handleRefresh}
                    visible={this.menuItemVisible} />
    }

    menuItemVisible = (i) => {
        return tagStore.matchMenuItem(barStore.allMenuItems[i])
    }
}

@observer
class ReviewButton extends PureComponent {
    /* properties:
        visible: Bool
    */
    @computed get reviewButtonVisible() {
        return orderStore.menuItemsOnOrder.length > 0
    }

    render = () => {
        if (!this.reviewButtonVisible)
            return <View />

        return <LargeButton
                    label={`Review`}
                    onPress={() => {
                        tabStore.setCurrentTab(3)
                    }}
                    style={{margin: 5, height: rowHeight}}
                    /*
                    prominent={false}
                    backgroundColor={config.theme.secondary.dark}
                    borderColor={config.theme.secondary.medium}
                    */ />
    }
}
