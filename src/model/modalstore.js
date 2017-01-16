import { observable, computed, action } from 'mobx'
import { drawerStore } from './drawerstore'
import { messageStore } from './messagestore'

class ModalStore {
    @observable showOpeningTimesModal    = false
    @observable showOrderModal           = false
    @observable showConfirmDeliveryModal = false
    @observable showDeliveryModal        = false
    @observable showCheckoutModal        = false

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

    @action openOrderModal = () => {
        this.showOrderModal = true
    }

    @action closeOrderModal = () => {
        this.showOrderModal = false
    }

    @action openConfirmDeliveryModal = () => {
        this.showConfirmDeliveryModal = true
    }

    @action closeConfirmDeliveryModal = () => {
        this.showConfirmDeliveryModal = false
    }

    @action openDeliveryModal = () => {
        this.showDeliveryModal = true
    }

    @action closeDeliveryModal = () => {
        this.showDeliveryModal = false
    }

    @action openCheckoutModal = () => {
        this.showCheckoutModal = true
    }

    @action closeCheckoutModal = () => {
        this.showCheckoutModal = false
    }
}

export const modalStore = new ModalStore()
