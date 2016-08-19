import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  ListView,
  Picker,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { PureComponent } from './Component.js'
import { MenuItem, createMenuItem } from './MenuPage.js'
import { LargeButton } from './Button.js'
import { T } from './AppText.js'
import { store } from './Store.js'
import { config } from './Config.js'

const largeButtonStyle = {
    height: 55,
    margin: 5,
}

@observer
export class OrderPage extends Component {

    render = () => {
        if (store.menuItemsOnOrder.length > 0)
            return this.renderOrderList()
        return this.renderEmptyOrder()
    }

    renderOrderList = () => {
        return <View style={{flex: 1}}>
            <ScrollView style={{flex: 1}}>
                {
                    store.menuItemsOnOrder.map(
                        menuItem =>
                            <MenuItem
                                key={menuItem.id}
                                menuItem={menuItem}
                                currentPage={3}
                                />
                    )
                }
            </ScrollView>
            <LargeButton
                label="Place Order"
                style={largeButtonStyle}
                />
        </View>
    }

    renderEmptyOrder = () => {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <LargeButton
                label="Add Items to Order"
                onPress={() => store.setCurrentTab(2)}
                style={largeButtonStyle}
                />
        </View>
    }
}
