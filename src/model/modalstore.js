import { observable, computed, action } from 'mobx'
import { drawerStore } from './drawerstore'
import { messageStore } from './messagestore'

class ModalStore {
    @observable showOpeningTimesModal = false
    @observable showDeliveryModal     = false
    @observable showOrderModal        = false
    @observable showCheckoutModal     = false

    initialize = () => {
    }

    getState = () => {
        return {
            showOpeningTimesModal: this.showOpeningTimesModal
        }
    }

    emptyState = () => {
        return {
            showOpeningTimesModal: false
        }
    }

    @action openOpeningTimesModal = () => {
        this.showOpeningTimesModal = true
    }

    @action closeOpeningTimesModal = () => {
        this.showOpeningTimesModal = false
    }

    @action openDeliveryModal = () => {
        this.showDeliveryModal = true
    }

    @action closeDeliveryModal = () => {
        this.showDeliveryModal = false
    }

    @action openOrderModal = () => {
        this.showOrderModal = true
    }

    @action closeOrderModal = () => {
        this.showOrderModal = false
    }

    @action openCheckoutModal = () => {
        this.showCheckoutModal = true
    }

    @action closeCheckoutModal = () => {
        this.showCheckoutModal = false
    }
}

export const modalStore = new ModalStore()
