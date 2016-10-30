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
} from '~/src/components/Component'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { Page } from '~/src/components/Page'
import { downloadManager } from '~/src/network/http'
import { DownloadResultView } from '~/src/components/download/DownloadResultView'
import { NotificationBar } from '~/src/components/NotificationBar'
import { OrderList } from '~/src/components/orders/OrderList'
import { LargeButton } from '~/src/components/Button'
import { TagView } from '~/src/components/TagView'

import { store, tabStore, barStore, barStatusStore, tagStore, orderStore } from '~/src/model/store'
import { config } from '~/src/utils/config'
import * as _ from '~/src/utils/curry'

/*********************************************************************/

import type { Int, String } from '../Types'
import type { OrderItem } from './orders/OrderStore'

/*********************************************************************/

const { log, assert } = _.utils('./menu/MenuPage')

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

    getDownloadResult = () => barStore.getMenuDownloadResult()

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
