import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { PureComponent } from './Component.js'
import { observable, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { loginStore } from './Store.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

/* Store */

class FavStore {
    @observable favItems = []
    @observable favBars = []

    toggleFavItem = (menuItemID) => {
        loginStore.login(() => {
            toggle(this.favItems, menuItemID)
        })
    }
    toggleFavBar = (barID) => {
        loginStore.login(() => {
            toggle(this.favBars, barID)
        })
    }

    isFavItem = (menuItemID) => _.includes(this.favItems, menuItemID)
    isFavBar = (barID) => _.includes(this.favBars, barID)

    getState = () => {
        return {
            favourites: {
                favItems: this.favItems,
                favBars: this.favBars,
            },
        }
    }

    @action setState = ({favourites}) => {
        this.favItems = favourites.favItems
        this.favBars = favourites.favBars
    }
}

const toggle = (idList, id) => {
    if (_.includes(idList, id))
        idList.remove(id)
    else
        idList.push(id)
}

export const favStore = new FavStore()

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
