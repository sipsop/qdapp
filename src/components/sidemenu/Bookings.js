import React, { Component } from 'react'
import { View } from 'react-native'
import { SideMenuEntry } from './ControlPanel'
import Icon from 'react-native-vector-icons'

export class Bookings extends Component {
    icon = (iconName, color) => <Icon name={iconName} size={25} color='rgba(255, 255, 255, 0.5)' />

    render = () => {
        return (
              <View>
                <SideMenuEntry
                    text="My Bookings"
                    icon={this.icon('text-document', 'rgb(19, 58, 194)')}
                    />
              </View>
        )
    }
}
