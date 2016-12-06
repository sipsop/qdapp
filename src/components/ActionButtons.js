import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Header } from '/components/Header'

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
})

@observer
export class ActionButtons extends PureComponent {
    render = () => {
        return (
            <Header style={styles.actionButtons}>
                {this.props.children}
            </Header>
        )
    }
}

@observer
export class ActionButton extends PureComponent {
    /* properties:
        textStyle: style object
        label: String
        onPress: () => void
    */
    render = () => {
        return (
            <View style={styles.button}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <Text style={[styles.buttonText, this.props.textStyle]}>
                        {this.props.label}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}
