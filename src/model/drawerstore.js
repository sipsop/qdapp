import { observable, transaction, computed, action } from 'mobx'

class DrawerStore {
    @observable open = false
    @observable disabled = false

    @action disable = () => this.disabled = true
    @action enable = () => this.disabled = false

    @action setOpen = () => this.open = true
    @action setClosed = () => this.open = false

    toggleOpenClose = () => {
        this.open = !this.open
    }

    @computed get drawerStyle() {
        let drawerStyle = {}
        if (this.open && !this.disabled) {
            drawerStyle = {
                shadowColor: '#000000',
                shadowOpacity: 0.8
                // shadowRadius: 3,
            }
        }
        return { drawer: drawerStyle, main: {} }
    }
}

export const drawerStore = new DrawerStore()
