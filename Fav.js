import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/FontAwesome'

import { PureComponent } from './Component.js'
import { observable, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { config } from './Config.js'

/* Store */

class FavStore {
    @observable favItems = []
    @observable favBars = []

    toggleFavItem = (menuItemID) => toggle(this.favItems, menuItemID)
    toggleFavBar = (barID) => toggle(this.favBars, barID)

    isFavItem = (menuItemID) => _.includes(this.favItems, menuItemID)
    isFavBar = (barID) => _.includes(this.favBars, barID)

    getState = () => {
        return {
            favItems: this.favItems,
            favBars: this.favBars,
        }
    }

    @action setState = (favState) => {
        this.favItems = favState.favItems
        this.favBars = favState.favBars
    }
}

const toggle = (idList, id) => {
    if (_.includes(idList, id))
        idList.remove(id)
    else
        idList.push(id)
}

export const favStore = new FavStore()

autorun(() => {
    console.log(JSON.stringify(favStore.getState()))
})

/* Components */

@observer export class Heart extends PureComponent {
    /* properties:
        id: ID
        style: style object
        iconSize: int
    */
    render = () => {
        const iconName = this.props.selected ? "heart" : "heart-o"
        return <TouchableOpacity onPress={this.props.toggle}>
            <View style={this.props.style}>
                <Icon
                    name={iconName}
                    size={this.props.iconSize}
                    color={config.theme.primary.medium}
                    />
                {this.props.children}
            </View>
        </TouchableOpacity>
    }
}

@observer export class FavBarContainer extends PureComponent {
    render = () => {
        const toggle = () => favStore.toggleFavBar(this.props.barID)
        const selected = favStore.isFavBar(this.props.barID)
        return <Heart selected={selected} toggle={toggle} {...this.props} />
    }
}

@observer export class FavItemContainer extends PureComponent {
    render = () => {
        const toggle = () => favStore.toggleFavItem(this.props.menuItemID)
        const selected = favStore.isFavItem(this.props.menuItemID)
        return <Heart selected={selected} toggle={toggle} {...this.props} />
    }
}
