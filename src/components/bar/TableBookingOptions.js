import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import { observer } from 'mobx-react/native'
import { computed } from 'mobx'
import { PINK_COLOR } from '/utils/appstyles/appColors'
import { modalStore } from '/model/store'

const styles = {
    container: {
        backgroundColor: '#fff',
    },
    btn: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        margin: 15,
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        color: PINK_COLOR,
        fontWeight: 'bold'
    },
}

export class TableBookingOptions extends Component {

    openModal = () => {
        modalStore.openBookingRequestModal()
    }

    render = () => {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.btn}
                    onPress={() => this.openModal()}
                >
                  <Text style={styles.text}>Book or join an existing table</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
