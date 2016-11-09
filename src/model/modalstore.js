import { observable, computed, action } from 'mobx'

class ModalStore {
  /* ALL MODALS */
  @observable showOpeningTimesModal = false
  @observable showMenuItemModal = false

    initialize = () => {
    }

    getState = () => {
        return {
            showOpeningTimesModal: this.showOpeningTimesModal,
            showMenuItemModal: this.showMenuItemModal
        }
    }

    emptyState = () => {
        return {
            showOpeningTimesModal: false,
            showMenuItemModal: false
        }
    }

    /* CLOSE/OPEN ACTIONS FOR ALL MODALS */

    // OpeningTimesModal
    @action openOpeningTimesModal = () => {
        this.showOpeningTimesModal = true
    }
    @action closeOpeningTimesModal = () => {
        this.showOpeningTimesModal = false
    }
    @computed get getOpeningModalStatus () {
        return this.showOpeningTimesModal
    }

    // MenuItemModal
    @action openMenuItemModal = () => {
        this.showMenuItemModal = true
    }
    @action closeMenuItemModal = () => {
        this.showMenuItemModal = false
    }
    @computed get getMenuItemModalStatus () {
        return this.showOpeningTimesModal
    }

}

export const modalStore = new ModalStore()
