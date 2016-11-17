import { React, Component, View, PureComponent, StyleSheet, Icon, T } from '/components/Component'
import { observer } from 'mobx-react/native'

import { formatDateTime } from '/utils/time'

const styles = StyleSheet.create({
    view: {
        flexDirection: 'row',
        alignItems: 'center',
        // borderTopWidth: 0.5,
        // borderBottomWidth: 0.5,
    },
    icon: {
        marginRight: 5,
    },
    text: {
        fontSize: 15,
    },
})

@observer
export class TimeView extends PureComponent {
    /* properties:
        time: String
        color: String
    */
    render = () => {
        const colorStyle = {color: this.props.color}
        return (
            <View style={styles.view}>
                <Icon
                    name="clock-o"
                    size={15}
                    color='rgba(89, 89, 89, 0.8)'
                    style={[styles.icon, colorStyle]}
                    />
                <T style={[styles.text, colorStyle]}>
                    {this.props.time}
                </T>
            </View>
        )
    }
}
