import { observable, computed, action } from 'mobx'

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

    @action openModal = () => {
        this.showOpeningTimesModal = true
    }

    @action closeModal = () => {
        this.showOpeningTimesModal = false
    }

    @computed get getModalStatus () {
        return this.showOpeningTimesModal
    }

}

export const modalStore = new ModalStore()
