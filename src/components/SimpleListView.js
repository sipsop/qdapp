import {
    React,
    View,
    PureComponent,
    ListView,
    RefreshControl,
    TextInput,
    Image,
    TouchableOpacity
} from '/components/Component.js'
import { observable, computed, action } from 'mobx'
import { observer } from 'mobx-react/native'

import * as _ from '/utils/curry.js'
import { config } from '/utils/config.js'

const { log, assert } = _.utils(__filename)

const visibleRowsIncrement = 5

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

    @observable visibleRows = this.visibleRowsIncrement

    constructor(props) {
        super(props)
        this._dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => this.rowHasChanged,
        })
        this.contentHeight = 0
        this.verticalScrollPosition = 0
    }

    get visibleRowsIncrement() {
        return this.props.visibleRowsIncrement || visibleRowsIncrement
    }

    @action resetVisibleRows = () => {
        this.visibleRows = this.visibleRowsIncrement
    }

    rowHasChanged = (row1, row2) => {
        return !_.deepEqual(row1, row2)
    }

    handleContentSizeChange = (contentWidth, contentHeight) => {
        this.contentHeight = contentHeight
    }

    handleScroll = (event) => {
        this.verticalScrollPosition = event.nativeEvent.contentOffset.y
    }

    scrollToTop = () => {
        this.listView.scrollTo({y: 0})
        /* NOTE: This needs to be async, otherwise it doesn't always scroll properly */
        setTimeout(() => {
            this.resetVisibleRows()
        }, 0)
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
            progressViewOffset: this.props.descriptor.progressViewOffset,
        })
    }

    @computed get numberOfVisibleRows() {
        // log("VISIBLE ROWS", this.visibleRows, "incr", this.visibleRowsIncrement)
        return _.min(this.props.descriptor.rows.length, this.visibleRows)
    }

    @computed get rows() {
        return this.props.descriptor
            .rows
            .slice(0, this.numberOfVisibleRows)
            .map((rowData, i) => [rowData, i])
    }

    @action handleEndReached = () => {
        // log("END REACHED, INCREASE VISIBLE ROWS")
        this.visibleRows += this.visibleRowsIncrement
    }

    @computed get dataSource() {
        return this._dataSource.cloneWithRows(this.rows)
    }

    saveRef = (listView) => {
        this.listView = listView
        if (this.props.getRef)
            this.props.getRef(listView)
    }

    renderRow = (rowData, sectionID, rowID, highlightRow) => {
        [rowData, i] = rowData
        return this.props.descriptor.renderRow(rowData, i, sectionID, rowID, highlightRow)
    }

    render = () => {
        return (
            <ListView
                ref={this.saveRef}
                dataSource={this.dataSource}
                removeClippedSubviews={true}
                enableEmptySections={true}
                renderRow={this.renderRow}
                refreshControl={this.getRefreshControl()}
                renderHeader={this.props.descriptor.renderHeader}
                renderFooter={this.props.descriptor.renderFooter}
                {...this.props}
                onContentSizeChange={this.handleContentSizeChange}
                scrollRenderAheadDistance={500}
                onScroll={this.handleScroll}
                onEndReachedThreshold={500}
                onEndReached={this.handleEndReached}
                />
        )
    }
}

export const themedRefreshControl = ({refreshing, onRefresh, progressViewOffset}) => {
    return <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={config.theme.primary.medium}
                progressViewOffset={progressViewOffset}
                title="Loading..."
                titleColor="#000"
                colors={[config.theme.primary.medium, config.theme.primary.dark, '#000']}
                progressBackgroundColor="#fff" />
}

export class Descriptor {

    @observable refreshing = false

    get rows() {
        throw Error("rows not implemented")
    }

    renderRow = (rowData, i) => {
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
        let descNumber = 0
        let x = i
        const descs = this.descriptors
        let descriptor = descs[descNumber]
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
