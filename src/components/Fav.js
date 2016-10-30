import { React, Component, PureComponent } from '~/components/Component.js'
import { View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { favStore } from '../model/favstore.js'
import { config } from '~/utils/config.js'
import * as _ from '~/utils/curry.js'

@observer
export class Heart extends PureComponent {
    /* properties:
        id: ID
        style: style object
        iconSize: int
        isSelected: () => Bool
        color: String
    */

    @computed get selected() {
        return this.props.isSelected()
    }

    render = () => {
        const iconName = this.selected ? "heart" : "heart-o"
        return <TouchableOpacity onPress={this.props.toggle}>
            <View style={this.props.style}>
                <Icon
                    name={iconName}
                    size={this.props.iconSize}
                    color={this.props.color || config.theme.primary.medium}
                    />
                {this.props.children}
            </View>
        </TouchableOpacity>
    }
}

@observer
export class FavBarContainer extends PureComponent {
    render = () => {
        const toggle = () => favStore.toggleFavBar(this.props.barID)
        const isSelected = () => favStore.isFavBar(this.props.barID)
        return <Heart isSelected={isSelected} toggle={toggle} {...this.props} />
    }
}

@observer
export class FavItemContainer extends PureComponent {
    render = () => {
        const toggle = () => favStore.toggleFavItem(this.props.menuItemID)
        const isSelected = () => favStore.isFavItem(this.props.menuItemID)
        return <Heart isSelected={isSelected} toggle={toggle} {...this.props} />
    }
}
