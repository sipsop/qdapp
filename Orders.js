import { observable, computed } from 'mobx'
import _ from 'lodash'
import shortid from 'shortid'

import { Price, sumPrices } from './Price.js'
import { updateSelection } from './Selection.js'

/* getMenuItemDefaultOptions : [schema.MenuItemOption] -> [Int] */
const getMenuItemDefaultOptions = (menuItemOption) => {
    if (menuItemOption.defaultOption == undefined)
        return []
    return updateSelection(menuItemOption.optionType, [], menuItemOption.defaultOption)
}

export class OrderItem {
    @observable amount : number = 1
    @observable selectedOptions = null

    constructor(menuItem) {
        this.id = shortid.generate()
        this.menuItem = menuItem
        // e.g. [[0], [], [1, 3]]
        this.selectedOptions = menuItem.options.map(getMenuItemDefaultOptions)
        this.currency = menuItem.price.currency
        this.showModal = true
    }

    /* Compute the price for all the selected options */
    @computed get subTotal() {
        const allPrices = _.zipWith(this.menuItem.options, this.selectedOptions,
            (menuItemOption, indices) => indices.map(i => menuItemOption.prices[i])
        )
        return sumPrices(_.flatten(allPrices))
    }

    @computed get total() {
        return this.subTotal * this.amount
    }

    toJSON = () => {
        return {
            menuItem: this.menuItem,
            selectedOptions: this.selectedOptions,
            amount: this.amount,
        }
    }

    static fromJSON = (orderItemJSON) : OrderItem => {
        const orderItem = new OrderItem(orderItemJSON.menuItem)
        orderItem.selectedOptions = orderItemJSON.selectedOptions
        orderItem.amount = orderItemJSON.amount
        orderItem.showModal = false
        return orderItem
    }
}
