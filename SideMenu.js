import React, { Component } from 'react'
import { View, TouchableOpacity, Platform } from 'react-native'
import { observable, transaction, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'
import Drawer from 'react-native-drawer'

import { PureComponent } from './Component.js'
import { T } from './AppText.js'

@observer
export class SideMenu extends PureComponent {
    /* properties:
        content: Component or [Component]
    */
    render = () => {
        //Parallax Effect (slack style)
        const open = drawerStore.open
        const content = open ? this.props.content : undefined
        return <Drawer
                    ref={ref => { this.drawer = ref}}
                    open={drawerStore.open}
                    onOpen={drawerStore.setOpen}
                    onClose={drawerStore.setClosed}
                    type="static"
                    content={content}
                    openDrawerOffset={0.25}
                    panCloseMask={0.25}
                    styles={drawerStore.drawerStyle}
                    disabled={drawerStore.disabled}
                    tweenHandler={Drawer.tweenPresets.parallax}
                    tapToClose={true}
                    /*elevation={2}*/
                    >
                {this.props.children}
            </Drawer>
    }
}

@observer
export class MenuIcon extends PureComponent {
    render = () => {
        return <TouchableOpacity onPress={drawerStore.toggleOpenClose}>
            <Icon name="bars" size={30} color="#000" />
        </TouchableOpacity>
    }
}

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
        var drawerStyle = {}
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

// const drawerStyle =
//     Platform.OS === 'android'
//         ? { shadowColor: '#000000'
//           , shadowOpacity: 0.8
//           // , shadowRadius: 3
//           }
//         : {}
