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
} from '/components/Component'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { downloadManager } from '/network/http'
import { DownloadResultView } from '/components/download/DownloadResultView'
import { NotificationBar } from '/components/notification/NotificationBar'
import { OrderList } from '/components/orders/OrderList'
import { LargeButton } from '/components/Button'
import { TagView } from '/components/TagView'
import { SearchBar } from '/components/search/SearchBar'

import { store, tabStore, barStore, barStatusStore, tagStore, orderStore, SearchStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

/*********************************************************************/

import type { Int, String } from '../Types'
import type { OrderItem } from './orders/OrderStore'

/*********************************************************************/

const { log, assert } = _.utils('./menu/MenuPage')

const rowHeight = 55

@observer
export class MenuPage extends DownloadResultView {
    inProgressMessage = "Loading menu..."
    getDownloadResult = () => barStore.getMenuDownloadResult()
    renderFinished = () => <MenuView />
}

@observer
export class MenuView extends PureComponent {
    render = () => {
        // if (!barStatusStore.isQDodgerBar)
        //     return null

        return <View style={{flex: 1, marginTop: 5}}>
            <MenuList />
            <ReviewButton />
        </View>
    }
}

const getWords = (menuItem) => {
    const result = menuItem.tags.filter(
        tagID => _.includes(tagStore.allTagIDs, tagID)
    )
    result.push(menuItem.name)
    return result
}

const searchStore = new SearchStore(getWords, () => tagStore.activeMenuItems)

@observer
class MenuList extends PureComponent {

    handleRefresh = async () => {
        await Promise.all([
            barStore.getMenuDownloadResult().forceRefresh(),
            tagStore.getTagDownloadResult().forceRefresh(),
        ])
    }

    componentDidMount = () => {
        // searchStore.initialize()
    }

    componentWillUnmount = () => {
        // searchStore.destroy()
    }

    @action handleTagChange = () => {
        searchStore.clearSearch()
    }

    render = () => {
        {/*
            NOTE: Pass a key to OrderList to ensure it does not
                  reuse state. This has the effect of "reloading"
                  the entire listview. Otherwise, if the user has
                  scrolled down say 100 items, then switching from
                  e.g. wine to beer will render 100 beer items, even
                  though only a few are visible.

            NOTE: SimpleListView should be performant enough that this
                  is no longer necessary!
        */}
        return <OrderList
                    /* key={tagStore.tagSelection.join(';')} */
                    orderStore={orderStore}
                    getMenuItems={() => searchStore.activeItems}
                    /* menuItems={barStore.allMenuItems} */
                    onRefresh={this.handleRefresh}
                    renderHeader={() => {
                        return (
                            <View>
                                <TagView onTagChange={this.handleTagChange} />
                                <SearchBar
                                    placeholder='Search...'
                                    searchStore={searchStore}
                                    />
                            </View>
                        )
                    }}
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
