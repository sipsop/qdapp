import {
    React,
    Component,
    View,
    PureComponent,
    ListView,
    RefreshControl,
    T,
} from './Component.js'
import { computed, observable, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import * as _ from './Curry.js'
import { config } from './Config.js'

const { log, assert } = _.utils('./SimpleListView.js')

@observer
export class SimpleListView extends PureComponent {
    /* properties:
        descriptor: Descriptor
        getRef: (listview : Component) => void
            pass as <ListView ref={getRef} ... />
        other props: passed to ListView, e.g.
            renderHeader: ?() => Component
            renderFooter: ?() => Component
            initialListSize: Int
            pageSize: Int
            etc
    */

    listView = null

    constructor(props) {
        super(props)
        this._dataSource = new ListView.DataSource({
            rowHasChanged: (i, j) => true, //i !== j,
        })
        this.contentHeight = 0
        this.verticalScrollPosition = 0
    }

    handleContentSizeChange = (contentWidth, contentHeight) => {
        this.contentHeight = contentHeight
    }

    handleScroll = (event) => {
        this.verticalScrollPosition = event.nativeEvent.contentOffset.y
    }

    scrollToTop = () => {
        this.listView.scrollTo({y: 0})
    }

    /* Scroll to the bottom of the page */
    scrollToBottom = () => {
        this.listView.scrollTo({y: this.contentHeight})
    }

    /* Scroll vertically relative to the current scroll position */
    scrollRelative = (y) => {
        this.listView.scrollTo({y: this.verticalScrollPosition + y})
    }

    getRefreshControl = () => {
        if (!this.props.descriptor.refresh)
            return undefined

        return themedRefreshControl({
            refreshing: this.props.descriptor.refreshing,
            onRefresh: this.props.descriptor.refresh,
        })
    }


    get dataSource() {
        return this._dataSource.cloneWithRows(
            _.range(this.props.descriptor.numberOfRows)
        )
    }

    saveRef = (listView) => {
        this.listView = listView
        if (this.props.getRef)
            this.props.getRef(listView)
    }

    render = () => {
        return <ListView
                    ref={this.saveRef}
                    dataSource={this.dataSource}
                    removeClippedSubviews={true}
                    enableEmptySections={true}
                    renderRow={this.props.descriptor.renderRow}
                    refreshControl={this.getRefreshControl()}
                    renderHeader={this.props.descriptor.renderHeader}
                    renderFooter={this.props.descriptor.renderFooter}
                    {...this.props}
                    onContentSizeChange={this.handleContentSizeChange}
                    onScroll={this.handleScroll} />
    }
}

export const themedRefreshControl = ({refreshing, onRefresh}) => {
    return <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={config.theme.primary.medium}
                title="Loading..."
                titleColor="#000"
                colors={[config.theme.primary.medium, config.theme.primary.dark, '#000']}
                progressBackgroundColor="#fff" />
}

export class Descriptor {

    @observable refreshing = false

    get numberOfRows() {
        throw Error("numberOfRows not implemented")
    }

    renderRow = (i) => {
        throw Error("renderRow not implemented")
    }

    refresh : ?() => void = undefined
    startRefresh = () => this.refreshing = true
    doneRefresh  = () => this.refreshing = false

    runRefresh = async (f) => {
        this.startRefresh()
        await f()
        this.doneRefresh()
    }
}

export class SingletonDescriptor {
    constructor(component) {
        this.component = component
    }

    get numberOfRows() {
        return 1
    }

    renderRow = (i) => {
        return this.component
    }
}

/* Cobine a list of Descriptors */
export class CombinedDescriptor extends Descriptor {
    constructor(descriptors : Array<Descriptor>, renderHeader, renderFooter) {
        super()
        this.descriptors  = descriptors
        this.renderHeader = renderHeader
        this.renderFooter = renderFooter
    }

    get numberOfRows() {
        return _.sum(this.descriptors.map(
            simpleListView => simpleListView.numberOfRows + 2
        ))
    }

    renderRow = (i) => {
        var descNumber = 0
        var x = i
        const descs = this.descriptors
        var descriptor = descs[descNumber]
        while (x >= descriptor.numberOfRows + 2) {
            x -= descriptor.numberOfRows + 2
            descNumber += 1
            descriptor = descs[descNumber]
        }
        if (x === 0) {
            return descriptor.renderHeader
                ? descriptor.renderHeader()
                : <View />
        } else if (x > descs[descNumber].numberOfRows) {
            return descriptor.renderFooter
                ? descriptor.renderFooter()
                : <View />
        } else {
            return descriptor.renderRow(x - 1)
        }
    }
}
