import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, Icon, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import { config } from '/utils/config.js'

const styles = StyleSheet.create({
     icons: {
        marginTop: 5,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        // height: 70,
    },
    optionIcon: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000',
    },
    selectedIconStyle: {
        borderBottomWidth: 2,
        borderColor: config.theme.primary.medium,
    },
    iconSubText: {
        flex: 1,
        textAlign: 'center',
    },
})

@observer
export class IconBar extends PureComponent {
    /* properties:
        icons: Array<TabIcon>
        children: Array<Component>
            each child should correspond to each icon in the icons list
    */

    @observable selectedIconIdx = 0

    @action selectIcon = (i : Int) => {
        this.selectedIconIdx = i
    }

    isSelected = (i) => {
        return i === this.selectedIconIdx
    }

    render = () => {
        const orderResult = this.props.orderResult
        const { Icon, iconSize } = this.props
        return (
            <View>
                <View style={styles.icons}>
                    {
                        this.props.icons.map((icon, i) => {
                            return (
                                React.cloneElement(
                                    icon, {
                                        isActive: () => this.isSelected(i),
                                        selectIcon: () => this.selectIcon(i),
                                    }
                                )
                            )
                        })
                    }
                </View>
                {this.props.children[this.selectedIconIdx]}
            </View>
        )
    }
}

@observer
export class BarIcon extends PureComponent {
    /* properties:
        Icon: Icon class
        ...props: passed to Icon
        label: String
            name associated with the icon (displayed below icon)
        getCounter: ?() => Int
            optionally, shows a counter (e.g. of how many items are ordered etc)

        isActive: () => Bool
            whether the icon is selected. Use this instead of a bool prop for
            performance!
        selectIcon: () => void
            select this icon
    */

    static defaultProps = {
        Icon: Icon,
        size: 60,
        color: '#000',
    }

    @computed get counter() {
        if (!this.props.getCounter)
            return 0
        return this.props.getCounter()
    }

    render = () => {
        const Icon = this.props.Icon
        /* TODO: use this.counter */
        return (
            <TouchableOpacity onPress={() => this.props.selectIcon()}>
                <View>
                    <Icon
                        {...this.props}
                        style={[styles.optionIcon, this.props.isActive() && styles.selectedIconStyle]}
                        />
                    <T style={styles.iconSubText}>{this.props.label}</T>
                </View>
            </TouchableOpacity>
        )
    }
}
