import { observable, computed, action } from 'mobx'
import { drawerStore } from './drawerstore'
import { messageStore } from './messagestore'

class ModalStore {
    @observable showOpeningTimesModal = false

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

    @computed get getModalStatus () {
        return this.showOpeningTimesModal
    }

}

export const modalStore = new ModalStore()
