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
import { downloadManager, DownloadResultView } from '../HTTP.js'
import { NotificationBar } from '../NotificationBar.js'
import { OrderList } from '../orders/OrderList.js'
import { LargeButton } from '../Button.js'
import { TagView } from '~/components/TagView.js'

import { store, tabStore, barStore, barStatusStore, tagStore, orderStore } from '~/model/store.js'
import { config } from '~/utils/config.js'
import * as _ from '~/utils/curry.js'

/*********************************************************************/

import type { Int, String } from '../Types.js'
import type { OrderItem } from './orders/OrderStore.js'

/*********************************************************************/

const { log, assert } = _.utils('./menu/MenuPage.js')

const rowHeight = 55

@observer
export class MenuPage extends Page {
    renderView = () => {
        return <MenuView />
    }
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

@observer
class MenuList extends DownloadResultView {

    errorMessage = "Error downloading menu"

    refreshPage = async () => {
        await Promise.all([
            barStore.updateMenuInfo(barStore.barID, force = true),
            // tagStore.fetchTags(restartDownload = false, force = true),
            downloadManager.forceRefresh('tags'),
        ])
    }

    getDownloadResult = () => downloadManager.getDownload('menu')

    renderFinished = () => {
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
                    onRefresh={this.refreshPage}
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
