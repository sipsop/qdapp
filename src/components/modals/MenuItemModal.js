import React from 'react'
import {
  Text,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native'
import {
    PureComponent,
    Img,
} from '/components/Component'
import { observer } from 'mobx-react/native'
import Modal from 'react-native-modalbox'

import { modalStore } from '/model/store'
import { Price } from '/components/Price'
import { PINK_COLOR } from '/utils/appstyles/appColors'
import { config } from '/utils/config.js'

const styles = {
    modalContainer: {
        width: 300,
        height: Platform.OS === 'ios' ? 510 : 425,
    },
    header: {
        textAlign: 'center',
        fontSize: 22,
        paddingTop: 5,
        fontWeight: 'bold',
        color: PINK_COLOR,
    },
    subheader: {
        textAlign: 'center',
        fontSize: 18,
        paddingTop: 5,
        fontWeight: 'bold',
        color: PINK_COLOR,
    },
    image: {
        height: 120,
    },
    seperator: {
        backgroundColor: '#f2f2f2',
        height: 1,
        marginRight: 25,
        marginLeft: 25,
    },
    tagBackground: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: PINK_COLOR,
        padding: 3,
        margin: 1,
    },
    tag: {
        color: PINK_COLOR,
        fontSize: 10,
    },
    tagRow: {
        padding: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceRow: {
        flex: 1,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    price: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    option: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: 'transparent',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: PINK_COLOR,
    },
    buttonText: {
        color: PINK_COLOR,
        fontSize: 17,
        textAlign: 'center',
        fontWeight: 'bold',
        paddingRight: 40,
        paddingLeft: 40,
        paddingTop: 5,
        paddingBottom: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
    },
    selected: {
    }
}

@observer
export class MenuItemModal extends PureComponent {

    renderTags = (tag, i) => {
        return (
            <View key={i} style={styles.tagBackground}><Text style={styles.tag}>{tag}</Text></View>
        )
    }
    renderTagRow = () => {
        let tags = modalStore.menuItem.tags
        if (tags !== undefined) {
            tags = tags.slice(0, 5)
            return (
              <View style={styles.tagRow}>
                  {tags.map((tag, i) => this.renderTags(tag, i))}
              </View>
            )
        }
        return <View />
    }
    renderPriceRow = (option, price, i) => {
        return (
            <TouchableOpacity onPress={this.onPricePress} style={[styles.priceRow, styles.selected]} key={i}><Text style={styles.option}>{option}</Text><Price price={price} style={styles.price} /></TouchableOpacity>
        )
    }
    renderGeneralPrices = (options) => {
        if (options !== undefined) {
            return options.map((val, o) => {
                if (val.optionType === 'Single') {
                    return val.optionList.map((opt, i) => {
                        return (
                          <View>
                              {this.renderPriceRow(opt, val.prices[i], i)}
                              <View style={styles.seperator} />
                          </View>
                        )
                    })
                } else {
                    return <View key={o} />
                }
            })
        }
    }
    renderExtraPrices = (options) => {
        if (options !== undefined) {
            return options.map((val, o) => {
                if (val.optionType === 'AtMostOne') {
                    return val.optionList.map((opt, i) => {
                        return (
                          <View>
                              {this.renderPriceRow(opt, val.prices[i], i)}
                              <View style={styles.seperator} />
                          </View>
                        )
                    })
                } else {
                    return <View key={o}/>
                }
            })
        }
    }
    onPricePress = (key) => {
        /*
            Idea here is to highlight the pressed row with a nice color
        */
    }

    onAddPress = () => {
        // Add chosen order to orderlist in state
    }

    renderAddButton = () => {
        return (
          <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button}
                  onPress={this.onAddPress}
              >
                  <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
          </View>
        )
    }

    render = () => {
        const menuItem = modalStore.menuItem
        const url = getMenuItemImage(menuItem, size = config.images.menuCardImgSize)

        return (
          <Modal style={styles.modalContainer} onClosed={this.props.onClosedProp} isOpen={this.props.isVisible}>
              <Img style={styles.image} url={url}/>
              <Text style={styles.header}>{menuItem.name}</Text>
              <View style={styles.seperator}/>
              {this.renderTagRow()}
              <View style={styles.seperator}/>
              {this.renderGeneralPrices(menuItem.options)}
              <Text style={styles.subheader}>Options</Text>
              {this.renderExtraPrices(menuItem.options)}
              {this.renderAddButton()}
          </Modal>
        )
    }
}

const getMenuItemImage = (menuItem, size = 'medium') : URL => {
    let image = menuItem.images && menuItem.images.length && menuItem.images[0]
    if (image && image.startsWith('/static')) {
        const parts = image.split('.')
        if (parts.length === 2) {
            [image, ext] = parts
            return `${image}-${size}.${ext}`
        }
    }
    return image
}
