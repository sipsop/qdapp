import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
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
                    /*type="static"*/
                    type="overlay"
                    content={content}
                    openDrawerOffset={0.25}
                    panCloseMask={0.25}
                    styles={drawerStyles}
                    disabled={drawerStore.disabled}
                    tweenHandler={tweenHandlers.material}
                    tapToClose={true}
                    /*elevation={2}*/
                    styles={{
                        drawer: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        },
                    }}
                    >
                {this.props.children}
            </Drawer>
    }
}

/* See https://github.com/root-two/react-native-drawer/blob/master/examples/RNDrawerDemo/tweens.js */

var deviceScreen = require('Dimensions').get('window')

const tweenHandlers = {
    material: (ratio) => {
        var drawerShadow = ratio < .2 ? ratio*5*5 : 5
        return {
            drawer: {
                shadowRadius: drawerShadow,
            },
            main: {
                opacity:(2-ratio)/2,
            },
        }
    },
    rotate: (ratio) => {
        var r0 = -ratio/8
        var r1 = 1-ratio/2
        var t = [
            r1,  r0,  0,  0,
            -r0, r1,  0,  0,
            0,   0,   1,  0,
            0,   0,   0,  1,
            ]

            return {
                main: {
                    transformMatrix:t,
                    left: ratio*300,
                },
            }
    },
    parallax: (ratio) => {
        var r1 = 1
        var t = [
            r1,  0,  0,  0,
            0, r1,  0,  0,
            0,   0,   1,  0,
            0,   0,   0,  1,
            ]
            return {
                main: {
                    left:deviceScreen.width*ratio/2,
                    transformMatrix: t,
                    opacity: 1-ratio*.3
                },
            }
    },
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
}

export const drawerStore = new DrawerStore()


const drawerStyles = {
    drawer: {
        shadowColor: '#000000',
        shadowOpacity: 0.8,
        // shadowRadius: 3,
    },
    main: {
        // paddingLeft: 3,
    },
}
