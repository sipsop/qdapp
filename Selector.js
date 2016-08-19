/* Item selection. We use an indirect to toggle items with the `Flag` class,
   so that we only have to re-render the changed items (useful for large lists).
*/

import React, { Component } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ListView,
} from 'react-native'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { T } from './AppText.js'
import { Button } from './Button.js'
import { config } from './Config.js'
import { makeList } from './Curry.js'

const dataSource = new ListView.DataSource({
    rowHasChanged: (i, j) => i !== j,
})

@observer
export class Selector extends PureComponent {
    /* properties:
        children: [Component]
        isSelected(i) -> bool
        onSelect(i) -> void
        renderRow(rowIndex) -> Component
    */

    constructor(props) {
        super(props)
        children = makeList(props.children)
        this.dataSource = dataSource.cloneWithRows(_.range(children.length))
    }

    render = () => {
        return <ListView
                    dataSource={this.dataSource}
                    renderRow={this.renderSelectorItem}
                    />
    }

    renderSelectorItem = (i) => {
        const children = makeList(this.props.children)
        return <SelectorItem
                    key={i}
                    rowNumber={i}
                    isSelected={() => this.props.isSelected(i)}
                    onPress={() => this.props.onSelect(i)}
                    >
                {children[i]}
        </SelectorItem>
    }
}

@observer
class SelectorItem extends PureComponent {
    /* properties:
        isSelected() -> bool
            callback to indicate whether this item is selected.
            This is a callback so that when we change the selection, only
            the affected components need to be re-rendered (instead of the
            entire Selector icon and all its children)
        onPress() -> void
            callback when this item is pressed
        rowNumber: int
    */

    @computed get isSelected() {
        return this.props.isSelected()
    }

    render = () => {
        const selected = this.isSelected
        const primary = this.props.rowNumber % 2 === 0
        /* color = "rgb(19, 179, 30)" */
        const color = primary ? config.theme.primary.medium
                              : config.theme.primary.dark

        const icon = selected
            ? <Icon name="check" size={30} color={color} />
            : undefined

        return (
            <Button
                    prominent={false}
                    primary={primary}
                    onPress={this.props.onPress}
                    style={{flex: 1, margin: 5}}
                >
                <View style={{flex: 1, justifyContent: 'center'}}>
                    {this.props.children}
                </View>
                <View style={{width: 50, height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    {icon}
                </View>
            </Button>
        )
    }

}
