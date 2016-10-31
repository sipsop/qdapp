/* Item selection. We use an indirect to toggle items with the `Flag` class,
   so that we only have to re-render the changed items (useful for large lists).
*/

import {
    React,
    View,
    ScrollView,
    TouchableOpacity,
    ListView,
    PureComponent,
    T,
} from '/components/Component.js'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'

import { Button } from './Button.js'
import { config } from '/utils/config.js'
import { SmallOkCancelModal } from './Modals.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('./Selector.js')

const dataSource = new ListView.DataSource({
    rowHasChanged: (i, j) => i !== j,
})

@observer
export class Selector extends PureComponent {
    /* properties:
        children: [Component]
        isSelected(i) -> bool
        onSelect(i) -> void
        useListView: bool
    */

    constructor(props) {
        super(props)
        children = _.makeList(props.children)
        this.dataSource = dataSource.cloneWithRows(_.range(children.length))
    }

    get children() {
        return _.makeList(this.props.children)
    }

    render = () => {
        if (this.props.useListView)
            return this.renderListView()
        return this.renderNormal()
    }

    renderListView = () => {
        return <ListView
                    dataSource={this.dataSource}
                    renderRow={this.renderSelectorItem}
                    />
    }

    renderNormal = () => {
        return <View style={{alignItems: 'stretch'}}>
            {_.range(this.children.length).map(this.renderSelectorItem)}
        </View>
    }

    renderSelectorItem = (i) => {
        const children = this.children
        return <SelectorItem
                    key={i}
                    rowNumber={i}
                    isSelected={() => this.props.isSelected(i)}
                    onPress={() => this.props.onSelect(i)}
                    >
                {children[i]}
        </SelectorItem>
    }
}

@observer
export class SelectorItem extends PureComponent {
    /* properties:
        isSelected() -> bool
            callback to indicate whether this item is selected.
            This is a callback so that when we change the selection, only
            the affected components need to be re-rendered (instead of the
            entire Selector icon and all its children)
        onPress() -> void
            callback when this item is pressed
        rowNumber: int
    */

    @computed get isSelected() {
        return this.props.isSelected()
    }

    render = () => {
        const selected = this.isSelected
        const primary = this.props.rowNumber % 2 === 0
        /* color = "rgb(19, 179, 30)" */
        const color = primary ? config.theme.primary.medium
                              : config.theme.primary.dark

        const icon = selected
            ? <Icon name="check" size={30} color={color} />
            : undefined

        return (
            // <Button
            //         prominent={false}
            //         primary={primary}
            //         onPress={this.props.onPress}
            //         style={{flex: 1, margin: 5}}
            //     >
            <SelectorRow onPress={this.props.onPress}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        {this.props.children}
                    </View>
                    <View style={{width: 50, height: 50, justifyContent: 'center', alignItems: 'center'}}>
                        {icon}
                    </View>
                </View>
            </SelectorRow>
        )
    }
}

@observer
export class SelectorRow extends PureComponent {
    /* properties:
        children: [Component]
        onPress: () => void
        align: 'left' | 'right' | 'center'
    */

    styles = {
        buttonRow: {
            flex: 0,
            height: 55,
            justifyContent: 'center',
            borderBottomWidth: 0.5,
            borderBottomColor: config.theme.primary.medium,
        },
    }

    render = () => {
        let alignItems = 'center'
        if (this.props.align === 'left')
            alignItems = 'flex-start'
        else if (this.props.align === 'right')
            alignItems = 'flex-end'
        const style = {...this.styles.buttonRow, alignItems: alignItems}
        return <TouchableOpacity
                    style={style}
                    onPress={this.props.onPress}
                    >
            {this.props.children}
        </TouchableOpacity>
    }
}

@observer
export class TextSelectorRow extends PureComponent {
    /* properties:
        label: String
        onPress: () => void
        confirmMessage: ?String
        align: 'left' | 'right' | 'center'
    */

    confirmModal = null

    showConfirmModal = () => {
        this.confirmModal.show()
    }

    render = () => {
        const style = this.props.style || {}
        const textStyle = {
            fontSize: 20,
            color: '#000',
        }

        const confirmModal =
            this.props.confirmMessage
                ? <SmallOkCancelModal
                    ref={ref => this.confirmModal = ref}
                    message={this.props.confirmMessage}
                    onConfirm={this.props.onPress}
                    />
                : undefined

        const onPress =
            this.props.confirmMessage
                ? this.showConfirmModal
                : this.props.onPress

        return <SelectorRow onPress={onPress} align={this.props.align}>
            <T style={[textStyle, style]}>
                {this.props.label}
            </T>
            {confirmModal}
        </SelectorRow>
    }
}
