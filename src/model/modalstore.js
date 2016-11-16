import { observable, computed, action } from 'mobx'
import { drawerStore } from './drawerstore'
import { messageStore } from './messagestore'

class ModalStore {
    @observable showOpeningTimesModal = false
    @observable showMessageListModal  = false

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

    @action openMessageListModal = () => {
        this.showMessageListModal = true
        drawerStore.disable()
        messageStore.acknowledgeAllUnread()
    }

    @action closeMessagListModal = () => {
        this.showMessageListModal = false
        drawerStore.enable()
    }

    @computed get getModalStatus () {
        return this.showOpeningTimesModal
    }

}

export const modalStore = new ModalStore()
