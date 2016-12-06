import { React, Component, PureComponent, ScrollView, TouchableOpacity, View, T, StyleSheet, Text, Picker, Switch } from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry'

const { assert, log } = _.utils('/model/admin/orderfilterstore.js')

class OrderFilterStore {
    @observable showTableService = true
    @observable pickupLocationName = 'All' // All, None, Main Bar, etc

    filterOrders = (orders : Array<OrderResult>) => {
        return orders.filter(orderResult => {
            if (orderResult.delivery === 'Table') {
                return this.showTableService
            } else {
                if (this.pickupLocationName === 'None') {
                    return false
                } else if (this.pickupLocationName === 'All') {
                    return true
                } else {
                    return orderResult.pickupLocation === this.pickupLocationName
                }
            }
        })
    }

    @action setTableService = (showTableService) => {
        this.showTableService = showTableService
    }

    @action setPickupLocation = (pickupLocationName) => {
        this.pickupLocationName = pickupLocationName
    }
}

export const orderFilterStore = new OrderFilterStore()
