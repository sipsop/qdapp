import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  View,
  ScrollView,
  ListView,
  TouchableOpacity,
} from 'react-native';
import Dimensions from 'Dimensions';
import LinearGradient from 'react-native-linear-gradient'
import _ from 'lodash'
import { observer } from 'mobx-react/native'

import { T } from './AppText.js'
import { SizeTracker } from './SizeTracker.js'
import { store } from './Store.js'
import { merge } from './Curry.js'


export class Category {
    constructor(title, source) {
        this.title = title
        this.source = source
        // this.menuItems = menuItems
    }
}


// https://github.com/leecade/react-native-swiper

@observer class BarMenu extends SizeTracker {
    /* properties:
        categories: [Category]
        bar: schema.Bar
    */

    render = () => {
        const bar = this.props.bar
        const menu = bar.menu
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
                onLayout={this.handleLayoutChange}
                >
            { rows.map(this.renderRow) }
        </View>
    }

    renderRow = (row, i) => {
        const rowWidth = this.state.width // - menuPadding * 2
        return <CardRow key={i} row={row} rowWidth={rowWidth} />
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
        const style = merge({borderRadius: radius}, this.props.style)

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
        store.setCurrentTab(2)
        // TODO: push this.props.tag
    }

}

/* Testing */

const beer = "http://www.menshealth.com/sites/menshealth.com/files/styles/slideshow-desktop/public/images/slideshow2/beer-intro.jpg?itok=hhBQBwWj"
// const wine = "http://pngimg.com/upload/wine_PNG9485.png"
const wine = "https://employee.foxandhound.com/Portals/0/images/slideshow/wine-pour-slide2.jpg"
const spirits = "https://biotechinasia.files.wordpress.com/2015/10/two-whisky-glasses.jpg"
// const cocktails = "http://binout.github.io/daiquiri/img/daiquiri.jpg"
const cocktails = "http://notable.ca/wp-content/uploads/2015/06/canada-day-cocktails.jpg"
const water = "http://arogyam.zest.md/uploads/gallery/df4fe8a8bcd5c95cdb640aa9793bb32b/images/201212042159565.jpg"
const snacks = "https://www.google.co.uk/search?q=peanuts&client=ubuntu&hs=sBq&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiT_47KnLnOAhXJuRoKHaNqD7QQ_AUICCgB&biw=1920&bih=919#tbm=isch&q=snacks&imgrc=sjXgiZ2yIgbsCM%3A"

const beerCategory = new Category("Beers", {uri: beer})
const wineCategory = new Category("Wines", {uri: wine})
const spiritCategory = new Category("Spirits", {uri: spirits})
const cocktailCategory = new Category("Cocktails", {uri: cocktails})
const waterCategory = new Category("Water", {uri: water})

const categories = [beerCategory, wineCategory, spiritCategory, cocktailCategory, waterCategory]

export const sampleBarMenu = (bar) => <BarMenu bar={bar} categories={categories} />

export { BarMenu }
