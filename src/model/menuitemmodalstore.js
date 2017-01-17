import { observable, computed, action } from 'mobx'
import { createOrderItem, orderStore } from './orders/orderstore'

class MenuItemModalStore {
    @observable modalVisible = false
    @observable menuItem : ?MenuItem  = null
    @observable modalType : ?MenuItemModalType = null
    @observable selectedOptions   : [[String]] = null
    orderItem = null

    @action open = ({ menuItem, orderItem, type }) => {
        this.modalVisible    = true
        this.menuItem        = menuItem
        this.modalType       = type
        this.orderItem       = orderItem
        this.selectedOptions = getSelectedOptions(menuItem, orderItem, type)
    }

    @action acceptSelection = () => {
        const orderItem = this.orderItem || createOrderItem(this.menuItem)
        orderItem.selectedOptions = this.selectedOptions
        if (this.modalType === 'Add') {
            orderStore.addOrderItem(orderItem)
        } else {
            // Nothing to do, we have already updated 'selectedOptions'
        }
    }

    @action close = () => {
        this.modalVisible    = false
        this.menuItem        = null
        this.modalType       = null
        this.orderItem       = null
        this.selectedOptions = null
    }
}

const getSelectedOptions = (menuItem, orderItem, modalType) => {
    if (modalType === 'Add') {
        orderItem = createOrderItem(menuItem)
    }
    // Copy currently-selected options as initial options
    return orderItem.selectedOptions.map(xs => xs.map(x => x))
}

export const menuItemModalStore = new MenuItemModalStore()
