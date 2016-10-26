import {
    React,
    Component,
    View,
    TouchableOpacity,
    PureComponent,
    Img,
    StyleSheet,
    T,
} from '../Component.js'
import shortid from 'shortid'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { MenuItemImage, getMenuItemImage } from './MenuItemImage.js'
import { BackButton } from '../BackButton.js'
import { Price } from '../Price.js'
import { FavItemContainer } from '../Fav.js'
import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'
import { tagStore } from '/model/store.js'

const { log, assert } = _.utils('./menu/DetailedMenuItem.js')

@observer
export class MenuItemCard extends PureComponent {
    /* properties:
        imageHeight: Int
        onBack: ?() => void
        show{Title,Price,Heart,Tags}: Bool
    */

    styles = StyleSheet.create({
        header: {
            flex: 1,
        },
        footer: {
            height: 60,
        },
        footerContent: {
            flex: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0)',
        },
    })

    render = () => {
        const menuItem = this.props.menuItem
        return <Img
                    style={{flex: 0, height: this.props.imageHeight}}
                    url={getMenuItemImage(menuItem, size = config.images.menuCardImgSize)}
                    >
            <View style={this.styles.header}>
                <BackButton
                    enabled={!!this.props.onBack}
                    onBack={this.props.onBack}
                    />
            </View>
            <LinearGradient
                    style={this.styles.footer}
                    colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}
                    >
                <View style={this.styles.footerContent}>
                    <MenuItemFooter
                        menuItem={menuItem}
                        showTitle={this.props.showTitle}
                        showTags={this.props.showTags}
                        showPrice={this.props.showPrice}
                        showHeart={this.props.showHeart}
                        />
                </View>
            </LinearGradient>
        </Img>
    }
}

@observer
class MenuItemFooter extends PureComponent {
    /* properties:
        menuItem: schema.MenuItem
        showTitle: Bool
        showTags:  Bool
        showHeart: Bool
        showPrice: Bool
    */

    styles = StyleSheet.create({
        content: {
            flex: 0,
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            margin: 5,
        },
        titleAndPrice: {
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
        },
        title: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        favIcon: {
            // flex: 0,
            // width: 50,
            // height: 50,
            // marginTop: 10,
            // marginBottom: 10,
            // alignItems: 'center',
        },
    })

    textStyles = {
        titleText: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#fff',
            // textDecorationLine: 'underline',
            marginRight: 5,
        },
        priceText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff',
        },
        infoText: {
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.8)',
        },
        tagText: {
            fontSize: 16,
            color: '#fff',
            justifyContent: 'center',
        },
    }

    render = () => {
        const menuItem = this.props.menuItem
        return <View style={this.styles.content}>
            <View style={this.styles.titleAndPrice}>
                <View style={this.styles.title}>
                    {
                        this.props.showTags &&
                            <T style={this.textStyles.tagText}>
                                {
                                    menuItem.tags
                                        .filter(tagStore.tagIsDefined)
                                        .map(tagStore.getTagName)
                                        .map(tagName => '#' + tagName)
                                        .join(' ')
                                }
                            </T>
                    }
                    {
                        this.props.showTitle &&
                            <T lineBreakMode='tail'
                                 numberOfLines={1}
                                 style={this.textStyles.titleText}
                                 >
                                {menuItem.name}
                            </T>
                    }
                </View>
                {
                    this.props.showPrice &&
                        <Price price={menuItem.price} style={this.textStyles.priceText} />
                }
                {
                    this.props.showHeart &&
                        <FavItemContainer
                            menuItemID={menuItem.id}
                            style={this.styles.favIcon}
                            iconSize={45}
                            color='#fff'
                            />
                }
            </View>
            {/*
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <T style={this.textStyles.tagText}>
                        {
                            menuItem.tags
                                .filter(tagStore.tagIsDefined)
                                .map(tagStore.getTagName)
                                .join(' ')
                        }
                    </T>
                    <T style={this.textStyles.infoText} numberOfLines={3}>
                        {menuItem.desc}
                    </T>
                </View>
                <FavItemContainer menuItemID={this.props.menuItem.id} style={this.styles.favIcon} iconSize={45} />
            </View>
            */}
        </View>
    }
}
