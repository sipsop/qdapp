import { React, Component, View, ScrollView, TouchableOpacity, PureComponent } from './Component.js'

import Icon from 'react-native-vector-icons/FontAwesome'
// import PickerAndroid from 'react-native-picker-android';
import { observable, computed, autorun, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

// import { PureComponent } from './Component.js'
import { updateSelectionInPlace } from './Selection.js'
import { Selector } from './Selector.js'
import { T } from './AppText.js'
import { Price } from './Price.js'
import { TextHeader } from './Header.js'
import { OkCancelModal } from './Modals.js'
import { TextButton, Button } from './Button.js'
import { store } from './Store.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

const rowHeight = 55

export class PickerItem {
    /* Attributes:
        title: str
        labels: [str]
            list of labels, displayed in the "button"
        prices: [schema.Price]
            price corresponding to each label
        defaultOption: int
            index of default option
            If there is no default, set to -1.
        selection: [int]
            currently selected items for this PickerItem
        optionType: str
            'Single' | 'ZeroOrMore' | 'OneOrMore'
    */

    // @observable selected
    // @observable selectedInModal

    constructor(title, labels, prices, defaultOption, selection, optionType) {
        this.title = title
        this.labels = labels
        this.prices = prices
        this.defaultOption = defaultOption
        this.selected = selection
        // this.selectedInModal = selection
        // this.selectedInModal = this.selected.map(i => i)
        this.optionType = optionType
        // autorun(() => {
        //     this.selectedInModal = this.selected.map(i => i)
        // })
    }
}

@observer
export class PickerCollection extends PureComponent {
    /* properties:
        pickerItems: [PickerItem]
        onAcceptChanges([PickerItem]) -> void
        rowNumber: int
        useListView: bool
            whether to use a ListView (many choices), or whether there should
            be a single ScrollView

        showModal: bool
            whether to show the choice modal window the first time
        onFirstAccept() -> void:
            called when the choice window is accepted the first time
        onFirstCancel() -> void:
            called when the choice window is cancelled on the first show
    */

    @observable modalVisible = false

    // Selection for each picker item: [[0], [], [2, 3]]
    @observable selectedInModal = null

    constructor(props) {
        super(props)
        if (props.showModal)
            this.showModal()
    }

    @action showModal = () => {
        this.modalVisible = true
        const pickerItems = this.props.pickerItems
        this.selectedInModal = pickerItems.map(pickerItem => pickerItem.selected)
    }

    @action closeModal = () => {
        this.modalVisible = false
    }

    @action okModal = () => {
        // this.props.pickerItems.forEach(pickerItem => {
        //     pickerItem.selected = pickerItem.selectedInModal
        // })
        this.props.onAcceptChanges(this.selectedInModal)
        if (this.props.showModal && this.props.onFirstAccept)
            this.props.onFirstAccept()
        this.closeModal()
    }

    @action cancelModal = () => {
        if (this.props.showModal && this.props.onFirstCancel)
            this.props.onFirstCancel()
        this.closeModal()
    }

    get showOkButton() {
        return this.props.pickerItems.length > 1 ||
               this.props.pickerItems[0].optionType !== 'Single'
    }

    render = () => {
        const pickerItems = this.props.pickerItems

        var modal = undefined
        if (this.modalVisible) {
            modal = <OkCancelModal
                        visible={this.modalVisible}
                        cancelModal={this.cancelModal}
                        okModal={this.okModal}
                        showOkButton={this.showOkButton}
                        >
                {this.renderItems()}
            </OkCancelModal>
        }

        return <View style={{flex: 1, marginLeft: 5, marginRight: 5}}>
            {modal}
            <PickerButton
                pickerItems={pickerItems}
                showModal={this.showModal}
                rowNumber={this.props.rowNumber}
                />
        </View>
    }

    renderItems = () => {
        const result = this.props.pickerItems.map(
            (pickerItem, i) =>
                <PickerItemView
                    key={i}
                    itemNumber={i}
                    allSelectedOptions={this.selectedInModal}
                    pickerItem={pickerItem}
                    confirmImmediately={!this.showOkButton}
                    confirmSelection={this.okModal}
                    useListView={this.props.useListView}
                    />
        )
        if (this.props.useListView)
            return result
        return <ScrollView>{result}</ScrollView>
    }
}

@observer
class PickerItemView extends PureComponent {
    /* properties:
        itemNumber: Int
        allSelectedOptions: [[Int]]
        pickerItem: PickerItem
        confirmImmediately: bool
            whether to confirm the selection on a single press
        confirmSelection() -> void
            confirm a new selection by closing the modal
        useListView: bool
    */

    @computed get selectedOptions() {
        return this.props.allSelectedOptions[this.props.itemNumber]
    }

    @action handleItemChange = (itemIndex) => {
        const pickerItem = this.props.pickerItem
        updateSelectionInPlace(
            pickerItem.optionType,
            this.selectedOptions,
            itemIndex,
        )
        if (this.props.confirmImmediately)
            this.props.confirmSelection()
    }

    isSelected = (labelNumber) => {
        return _.includes(this.selectedOptions, labelNumber)
    }

    render = () => {
        const pickerItem = this.props.pickerItem
        const flex =
            this.props.useListView ? 1 : 0
        const backgroundColor =
            this.props.itemNumber % 2 === 0
                ? config.theme.primary.medium
                : config.theme.primary.medium
        return (
            <View style={{flex: flex, alignItems: 'stretch'}}>
                <TextHeader label={pickerItem.title} />
                <Selector
                        isSelected={this.isSelected}
                        onSelect={this.handleItemChange}
                        useListView={this.props.useListView}
                        >
                    {
                        pickerItem.labels.map(
                            (label, i) =>
                                <LabelView
                                    key={i}
                                    label={label}
                                    price={pickerItem.prices[i]}
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

@observer
class PickerButton extends PureComponent {
    /* properties:
        pickerItems: [PickerItem]
        showModal() -> void
            callback to trigger modal popup
        rowNumber: int
    */
    render = () => {
        return <TextButton
                    label={this.renderLabels()}
                    fontSize={16}
                    onPress={this.props.showModal}
                    style={{flex: 1}}
                    primary={this.props.rowNumber % 2 === 0}
                    alignLeft={true}
                    />
    }

    renderLabels = () => {
        /* Get all non-default labels */
        const nonDefaultLabels = this.props.pickerItems.map((pickerItem, i) => {
            if (pickerItem.selected.length == 1 &&
                    pickerItem.selected[0] == pickerItem.defaultOption) {
                return []
            }
            return pickerItem.selected.map(itemIndex => pickerItem.labels[itemIndex])
        })
        const labels = _.flatten(nonDefaultLabels)
        if (labels.length === 0) {
            const firstItem = this.props.pickerItems[0]
            return firstItem.labels[0]
        }
        return _.flatten(nonDefaultLabels).join(' + ')
    }
}
