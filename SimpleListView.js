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
        renderRow(i : Int) => void
        N: Int
            total number of items

        other props: passed to ListView, e.g.
            renderHeader: ?() => Component
            renderFooter: ?() => Component
            initialPageSize: Int
            pageSize: Int
            etc
    */
    constructor(props) {
        super(props)
        this._dataSource = new ListView.DataSource({
            rowHasChanged: (i, j) => i !== j,
        })
    }

    get dataSource() {
        return this._dataSource.cloneWithRows(_.range(this.props.N))
    }

    render = () => {
        return <ListView
                    dataSource={this.dataSource}
                    {...this.props}
                    />
    }

}
