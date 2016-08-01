import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ListView,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import Dimensions from 'Dimensions';
import _ from 'lodash'

import { SizeTracker } from './SizeTracker.js'


export class Category {
    constructor(title, source) {
        this.title = title
        this.source = source
    }
}


const menuPadding = 10

// https://github.com/leecade/react-native-swiper

export class BarMenu extends SizeTracker {
    /* properties:
        categories: [Category]
        cardsPerRow: int
            number of cards to display per row
    */

    render = () => {
        const cateogires = this.props.categories
        const evens = _.filter(categories, (x, i) => i % 2 == 0)
        const odds  = _.filter(categories, (x, i) => i % 2 == 1)
        const rows  = _.zip(evens, odds)
        return <View style={[styles.vertical, {padding: menuPadding}]}
                     onLayout={this.handleLayoutChange}>
            { rows.map(this.renderRow) }
        </View>
    }

    renderRow = (rowCategories, i) => {
        const rowWidth = this.state.width - menuPadding * 2
        rowCategories = rowCategories.filter((c) => c !== undefined)
        return <CardRow key={i} categories={rowCategories} rowWidth={rowWidth} />
    }
}

class CardRow extends Component {
    /* properties:
        categories: [Category]
            categories to display in cards
        rowWidth: int
    */
    render = () => {
        return <View style={styles.horizontal}>
            {this.props.categories.map(this.renderCategory)}
        </View>
    }

    renderCategory = (category, i) => {
        const n = this.props.categories.length
        const margin = 10
        const cardSpace = this.props.rowWidth - 4 * margin
        const cardWidth =  cardSpace / 2
        if (!cardWidth) {
            throw Error(this.props.rowWidth)
        }
        const cardStyle = {
            margin: margin,
            width:  cardWidth,
            height: cardWidth,
            // borderRadius: 20,
        }
        return <Card key={i} category={category} style={cardStyle} />
    }
}

class Card extends Component {
    /* properties:
        category: Category
        style: style object
    */

    constructor(props) {
        super(props)
        this.state = {active: false}
    }

    render = () => {
        const category = this.props.category
        const style = this.props.style

        return <TouchableOpacity onPress={this.handleCardPress}>
            <View style={styles.vertical}>
                <Image source={category.source} style={style} />
                <Text>{category.title}</Text>
            </View>
        </TouchableOpacity>
    }

    handleCardPress = () => {
        this.setState({active: true})
    }

}

const styles = StyleSheet.create({
    vertical: {
        flexDirection:  'column',
        justifyContent: 'center',
        alignItems:     'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
})


/* Testing */

const beer = "http://www.menshealth.com/sites/menshealth.com/files/styles/slideshow-desktop/public/images/slideshow2/beer-intro.jpg?itok=hhBQBwWj"
// const wine = "http://pngimg.com/upload/wine_PNG9485.png"
const wine = "https://employee.foxandhound.com/Portals/0/images/slideshow/wine-pour-slide2.jpg"
const spirits = "https://biotechinasia.files.wordpress.com/2015/10/two-whisky-glasses.jpg"
// const cocktails = "http://binout.github.io/daiquiri/img/daiquiri.jpg"
const cocktails = "http://notable.ca/wp-content/uploads/2015/06/canada-day-cocktails.jpg"
const water = "http://arogyam.zest.md/uploads/gallery/df4fe8a8bcd5c95cdb640aa9793bb32b/images/201212042159565.jpg"

const beerCategory = new Category("Beers", {uri: beer})
const wineCategory = new Category("Wines", {uri: wine})
const spiritCategory = new Category("Spirits", {uri: spirits})
const cocktailCategory = new Category("Cocktails", {uri: cocktails})
const waterCategory = new Category("Water", {uri: water})

const categories = [beerCategory, wineCategory, spiritCategory, cocktailCategory, waterCategory]

export const SampleBarMenu = () => <BarMenu categories={categories} />
