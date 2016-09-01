import {
    React,
    Component,
    Image,
    View,
    TouchableOpacity,
    Dimensions,
    PureComponent,
} from '../Component.js'
import LinearGradient from 'react-native-linear-gradient'
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { T } from '../AppText.js'
import { store, favStore, tabStore } from '../Store.js'

import type { String, URL } from '../Types.js'

export type Category = {
    title:  String,
    url:    URL,
}

@observer export class BarMenu extends PureComponent {
    /* properties:
        bar: Bar
        menu: Menu
    */

    render = () => {
        const bar = this.props.bar
        const menu = this.props.menu
        const rows =
            [ [ { name: "Beer", tag: '#beer', submenu: menu.beer }
              , { name: "Wine", tag: "#wine", submenu: menu.wine }
              ]
            , [ { name: "Spirits", tag: '#spirits', submenu: menu.spirits }
              , { name: "Cocktails", tag: '#cocktails', submenu: menu.cocktails }
              ]
            , [ { name: "Water", tag: '#water', submenu: menu.water } ]
            // , [ { name: "Snacks", tag: '#snacks', submenu: menu.snacks }
            //   , { name: "Food", tag: '#food', submenu: menu.food }
            //   ]
            ]
        return <View
                style={
                    { justifyContent: 'center'
                    , alignItems: 'center'
                    , marginLeft: 5
                    , marginRight: 5
                    }}
                >
            { rows.map(this.renderRow) }
        </View>
    }

    renderRow = (row, i) => {
        const { width } = Dimensions.get('window') // - menuPadding * 2
        return <CardRow key={i} row={row} rowWidth={width} />
    }

}

@observer class CardRow extends Component {
    /* properties:
        row: [{name: str, tag: str, submenu: schema.SubMenu}]
            list of submenus to show in a row
        rowWidth: int
    */
    render = () => {
        return <View style={
                { flexDirection: 'row'
                , justifyContent: 'space-around'
                }
            }>
            {this.props.row.map(this.renderSubMenu)}
        </View>
    }

    renderSubMenu = (item, i) => {
        const n = this.props.row.length
        const margin = 5
        const cardSpace = this.props.rowWidth - 4 * margin
        const cardWidth =  cardSpace / 2
        // Sanity check
        if (!cardWidth) {
            throw Error(this.props.rowWidth)
        }
        return <Card
                    key={i}
                    name={item.name}
                    tag={item.tag}
                    submenu={item.submenu}
                    style={
                        { margin: margin
                        , width:  cardWidth
                        , height: cardWidth
                        }
                    }
                    />
    }
}

@observer class Card extends Component {
    /* properties:
        name: str
            e.g. "Beer", "Wine"
        tag: str
            e.g. "#beer", "#wine" etc
        submenu: schema.SubMenu
        style: style object
    */
    render = () => {
        const submenu = this.props.submenu
        const radius = 20
        const style = {borderRadius: radius, ...this.props.style}

        return <TouchableOpacity onPress={this.handleCardPress}>
            <Image source={{uri: submenu.image}} style={style}>
                {/* Push footer to bottom */}
                <View style={{flex: 1, borderRadius: radius}} />
                <LinearGradient
                        style={{flex: 1, borderRadius: radius}}
                        colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}
                        >
                    <View style={
                            { flex: 1
                            , justifyContent: 'flex-end'
                            , alignItems: 'center'
                            , borderRadius: radius
                            }
                        }>
                        <T style={
                                { fontSize: 20
                                , color: 'rgba(255, 255, 255, 95)'
                                , marginBottom: 5
                                }}>
                            {this.props.name}
                        </T>
                    </View>
                </LinearGradient>
            </Image>
        </TouchableOpacity>
    }

    handleCardPress = () => {
        tabStore.setCurrentTab(2)
        // TODO: push this.props.tag
    }

}