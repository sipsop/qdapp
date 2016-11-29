import { observable, computed, action } from 'mobx'

class ModalStore {
  @observable showOpeningTimesModal = false
  @observable showBookingRequestModal = false

    initialize = () => {
    }

    getState = () => {
        return {
            showOpeningTimesModal: this.showOpeningTimesModal,
            showBookingRequestModal: this.showBookingRequestModal,
        }
    }

    emptyState = () => {
        return {
            showOpeningTimesModal: false,
            showBookingRequestModal: false,
        }
    }

    @action openOpeningModal = () => {
        this.showOpeningTimesModal = true
    }
    @action closeOpeningModal = () => {
        this.showOpeningTimesModal = false
    }

    @action openBookingRequestModal = () => {
        this.showBookingRequestModal = true
    }
    @action closeBookingRequestModal = () => {
        this.showBookingRequestModal = false
    }

    @computed get getModalStatus () {
        return this.showOpeningTimesModal
    }
}

export const modalStore = new ModalStore()
