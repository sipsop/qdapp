/* Item selection. We use an indirect to toggle items with the `Flag` class,
   so that we only have to re-render the changed items (useful for large lists).
*/

import React, { Component } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { observer } from 'mobx-react/native'

import { PureComponent } from './Component.js'
import { T } from './AppText.js'

@observer
export class Selector extends PureComponent {
    /* properties:
        children: [Component]
        flags: [Flag]
        onSelect(i) -> void
    */

    render = () => {
        var children = this.props.children
        if (!Array.isArray(children))
            children = [children]

        return <ScrollView>
            {_.zipWith(
                children,
                this.props.flags,
                _.range(children.length),
                this.renderSelectorItem,
                )
            }
        </ScrollView>
    }

    renderSelectorItem = (child, flag, i) => {
        return <SelectorItem
                    key={i}
                    flag={flag}
                    onPress={() => this.props.onSelect(i)}
                    >
                {child}
        </SelectorItem>
    }
}

@observer
class SelectorItem extends PureComponent {
    /* properties:
        flag: Flag
            indicates whether this item is selected
        onPress() -> void
            callback when this item is pressed
    */
    render = () => {
        const selected = this.props.flag.get()
        const icon = selected
            ? <Icon name="check" size={30} color="rgb(19, 179, 30)" />
            : undefined

        return <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity
                    style={{flex: 1, flexDirection: 'row'}}
                    onPress={this.props.onPress}
                    >
                <View style={{flex: 1, justifyContent: 'center'}}>
                    {this.props.children}
                </View>
                <View style={{width: 50, height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    {icon}
                </View>
            </TouchableOpacity>
        </View>
    }
}
