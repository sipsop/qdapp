import { observable, computed, action } from 'mobx'
import { drawerStore } from './drawerstore'
import { messageStore } from './messagestore'

class ModalStore {
    @observable showOpeningTimesModal = false
    @observable showDeliveryModal = false

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
        console.log("CLOSING DELIVERY MODAL!")
        this.showDeliveryModal = false
    }

    @computed get getModalStatus () {
        return this.showOpeningTimesModal
    }

}

export const modalStore = new ModalStore()
