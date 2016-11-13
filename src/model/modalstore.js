import { observable, computed, action } from 'mobx'

class ModalStore {
  /* ALL MODALS */
  @observable showOpeningTimesModal = false
  @observable showMenuItemModal = false
  @observable menuItem = false

    initialize = () => {
    }

    getState = () => {
        return {
            showOpeningTimesModal: this.showOpeningTimesModal,
            showMenuItemModal: this.showMenuItemModal,
            menuItem: this.menuItem
        }
    }

    emptyState = () => {
        return {
            showOpeningTimesModal: false,
            showMenuItemModal: false,
            menuItem: {}
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
    @action openMenuItemModal = (menuItem) => {
        this.menuItem = menuItem
        this.showMenuItemModal = true
    }
    @action closeMenuItemModal = () => {
        this.showMenuItemModal = false
    }
    @computed get getMenuItemModalStatus () {
        return this.showOpeningTimesModal
    }
    @computed get getMenuItem () {
        return this.menuItem
    }

}

export const modalStore = new ModalStore()
