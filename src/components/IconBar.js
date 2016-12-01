import {
    React, Component, Platform, View, TouchableOpacity, ScrollView, ListView,
    T, Mono, PureComponent, Icon, MaterialIcon, StyleSheet,
} from '/components/Component.js'
import { observable, action, autorun, computed, asMap } from 'mobx'
import { observer } from 'mobx-react/native'

import IconBadge from 'react-native-icon-badge'

import { config } from '/utils/config.js'

const styles = StyleSheet.create({
    icons: {
        // flex: 1,
        marginTop: 5,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-around',
        // height: 70,
    },
    barIcon: {
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    optionIcon: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000',
        paddingBottom: 7,
    },
    selectedIconStyle: {
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderColor: config.theme.primary.medium,
    },
    iconSubText: {
        // flex: 1,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: config.theme.primary.medium,
        width: 25,
        height: 25,
    },
    badgeText: {
        color: '#fff',
    },
})

@observer
export class IconBar extends PureComponent {
    /* properties:
        style: style object
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
        const { Icon, iconSize } = this.props
        return (
            <View style={this.props.style}>
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
        return this.props.getCounter && this.props.getCounter()
    }

    render = () => {
        const Icon = this.props.Icon
        /* TODO: use this.counter */
        const result = (
            <TouchableOpacity onPress={() => this.props.selectIcon()}>
                <View style={styles.barIcon}>
                    <Icon
                        {...this.props}
                        style={[styles.optionIcon, this.props.isActive() && styles.selectedIconStyle]}
                        />
                    <T style={styles.iconSubText}>{this.props.label}</T>
                </View>
            </TouchableOpacity>
        )

        if (!this.props.getCounter)
            return result

        return (
            <IconBadge
                MainElement={result}
                BadgeElement={<T style={styles.badgeText}>{this.counter}</T>}
                IconBadgeStyle={styles.badge}
                />
        )
    }
}
