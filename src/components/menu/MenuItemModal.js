import { React, Component, ScrollView, View, TouchableOpacity, Image,
         Icon, MaterialIcon, PureComponent, T, StyleSheet,
} from '/components/Component'
import { observable, computed, transaction, autorun, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { LazyComponent } from '../LazyComponent.js'
import { TextHeader } from '../Header.js'
import { Selector } from '../Selector.js'
import { MenuItemImage, getMenuItemImage } from './MenuItemImage'
import { OkCancelModal } from '../Modals.js'
import { MenuItemCard } from './MenuItemCard'
import { Price } from '../Price'
import { createOrderItem } from '/model/orders/orderstore'
import { addToSelectionInPlace } from '/model/orders/orderSelection'
import { menuItemModalStore } from '/model/store'
import * as _ from '/utils/curry'
import { config } from '/utils/config'

const { log, assert } = _.utils('/components/menu/MenuItemModal.js')


export type MenuItemModalType =
    | 'Add'
    | 'Change'


@observer
export class MenuItemModal extends PureComponent {
    /* properties:

    */

    acceptSelection = () => {
        menuItemModalStore.acceptSelection()
        menuItemModalStore.close()
    }

    render = () => {
        return (
            <OkCancelModal
                    visible={menuItemModalStore.modalVisible}
                    showOkButton={true}
                    okLabel={menuItemModalStore.modalType}
                    okModal={this.acceptSelection}
                    showCancelButton={true}
                    cancelLabel="Cancel"
                    cancelModal={menuItemModalStore.close}
                    >
                <ModalView
                    menuItem={menuItemModalStore.menuItem}
                    />
            </OkCancelModal>
        )
    }
}

class ModalView extends PureComponent {
    /* properties:
        menuItem: MenuItem
    */

    /* Render menu image */
    renderHeader = () => {
        const url = getMenuItemImage(this.props.menuItem)
        if (!url)
            return null

        return (
            <View style={{flex: 1}}>
                <LazyComponent style={{height: 200}}>
                    <MenuItemCard
                        key={url}
                        menuItem={this.props.menuItem}
                        showTitle={false}
                        showHeart={true}
                        showTags={true}
                        imageHeight={200}
                        />
                </LazyComponent>

            </View>
        )
    }

    render = () => {
        const menuItem = this.props.menuItem
        return (
            <ScrollView>
                {
                    this.renderHeader()
                }
                {
                    menuItem.options.map(
                        (menuItemOption, i) =>
                            <Picker
                                key={i}
                                title={i === 0 ? menuItem.name : menuItemOption.name}
                                menuItemOption={menuItemOption}
                                selectedItemOptions={menuItemModalStore.selectedOptions[i]}
                                />
                    )
                }
            </ScrollView>
        )
    }
}

@observer
class Picker extends PureComponent {
    /* properties:
        title: String
        menuItemOption: MenuItemOption
        selectedItemOptions: [String]
    */

    @action handleItemChange = (itemIndex) => {
        addToSelectionInPlace(
            this.props.menuItemOption.optionType,
            this.props.selectedItemOptions,
            this.props.menuItemOption.optionList[itemIndex],
        )
    }

    isSelected = (labelNumber : Int) => {
        const label = this.props.menuItemOption.optionList[labelNumber]
        return _.includes(this.props.selectedItemOptions, label)
    }

    render = () => {
        const menuItemOption = this.props.menuItemOption
        return (
            <View style={{flex: 1, alignItems: 'stretch'}}>
                <TextHeader label={this.props.title} />
                    <Selector
                        isSelected={this.isSelected}
                        onSelect={this.handleItemChange}
                        >
                        {
                            menuItemOption.optionList.map(
                                (option, i) =>
                                    <LabelView
                                        key={i}
                                        label={option}
                                        price={menuItemOption.prices[i]}
                                        />
                            )
                        }
                    </Selector>
            </View>
        )
    }
}

@observer
class LabelView extends PureComponent {
    /* properties:
        label: str
        price: Price
    */

    render = (i) => {
        const textStyle = {fontSize: 20, color: '#000'}
        return <View key={i} style={
                { flex: 1
                , flexDirection: 'row'
                , alignItems: 'center'
                , paddingLeft: 10
                , paddingRight: 10
                }
            }>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <T style={textStyle}>{this.props.label}</T>
            </View>
            <Price price={this.props.price} style={textStyle} />
        </View>
    }
}
