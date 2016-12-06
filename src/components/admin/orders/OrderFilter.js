import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { barStatusStore, orderFilterStore } from '/model/store'
import { config } from '/utils/config'
import * as _ from '/utils/curry'

const { assert, log } = _.utils('/components/admin/orders/OrderFilter')

const styles = StyleSheet.create({
    orderFilter: {
        height: 55,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tableService: {
        flexDirection: 'row',
        alignItems: 'center'
    },
})


@observer
export class OrderFilter extends PureComponent {
    @computed get pickupLocationNames() {
        const result = ['All']
        _.extend(result, barStatusStore.pickupLocationNames)
        result.push('None')
        return result
    }

    render = () => {
        return (
            <View style={styles.orderFilter}>
                <Picker
                    style={{width: 130}}
                    selectedValue={orderFilterStore.pickupLocationName}
                    onValueChange={orderFilterStore.setPickupLocation}
                    >
                    {
                        this.pickupLocationNames.map((value, i) => {
                            return (
                                <Picker.Item
                                    key={value}
                                    label={value}
                                    value={value}
                                    />
                            )
                        })
                    }
                </Picker>
                <View style={styles.tableService}>
                    <T>Show Table Service</T>
                    <Switch
                        value={orderFilterStore.showTableService}
                        onValueChange={orderFilterStore.setTableService}
                        onTintColor={config.theme.primary.medium}
                        />
                </View>
            </View>
        )
    }
}
