import {
    React,
    Component,
    View,
    PureComponent,
    ListView,
    T,
} from './Component.js'
import { observer } from 'mobx-react/native'

import { Page } from './Page.js'
import * as _ from './Curry.js'

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
    }

    get dataSource() {
        return this._dataSource.cloneWithRows(
            _.range(this.props.descriptor.numberOfRows)
        )
    }

    render = () => {
        return <ListView
                    ref={this.props.getRef}
                    dataSource={this.dataSource}
                    removeClippedSubviews={true}
                    enableEmptySections={true}
                    renderRow={this.props.descriptor.renderRow}
                    renderHeader={this.props.descriptor.renderHeader}
                    renderFooter={this.props.descriptor.renderFooter}
                    {...this.props} />
    }
}

export class Descriptor {
    get numberOfRows() {
        throw Error("numberOfRows not implemented")
    }

    renderRow = (i) => {
        throw Error("renderRow not implemented")
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
