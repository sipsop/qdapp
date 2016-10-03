import {
    React,
    Component,
    View,
    PureComponent,
    Img,
    T,
} from '../Component.js'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'
import * as _ from '../Curry.js'
import { config } from '../Config.js'

const { log, assert } = _.utils('./Menu/MenuItemImage.js')

@observer
export class MenuItemImage extends PureComponent {
    /* properties:
        menuItem: MenuItem
        style: style object
    */

    render = () => {
        const style = this.props.style || styles.image
        const menuItem = this.props.menuItem
        const url = getMenuItemImage(menuItem)
        return <Img url={url} style={style} />
    }
}

export const getMenuItemImage = (menuItem : menuItem) : URL => {
    return menuItem.images && menuItem.images.length && menuItem.images[0]
}


const styles = {
    image: {
        width:  100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
}
