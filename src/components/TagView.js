import {
    React,
    Component,
    PureComponent,
    View,
    TouchableOpacity,
    Icon,
} from '/components/Component.js'
import { observable, computed, transaction, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { DownloadResultView } from './download/DownloadResultView'
import { ButtonRow, ButtonGroup } from './ButtonRow.js'
import { T } from '/components/Component.js'
import { downloadManager } from '/network/http'
import { analytics } from '/model/analytics.js'
import { tagStore } from '/model/tagstore.js'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('./components/tags.js')

@observer
export class TagView extends PureComponent {
    /* properties:
        children: [Component]
    */

    render = () => {
        const { rows, menuItems } = tagStore.visibleTagRows

        return <View>
            {rows.map((rowOfTags, i) =>
                <TagRow
                    key={i}
                    rowNumber={i}
                    rowOfTags={rowOfTags}
                    menuItems={menuItems}
                    isExcluded={tagID => false}
                    />
                )
            }
        </View>
    }

}

@observer
export class TagRow extends Component {
    /* properties:
        rowNumber: int
        rowOfTags: [TagID]
        menuItems: [schema.MenuItem]
        isExcluded(tagID) -> bool
    */

    @action toggleButton = (tagID) => {
        if (this.isActive(tagID)) {
            tagStore.popTag(tagID)
        } else {
            tagStore.pushTag(tagID)
        }
        // if (tagStore.tagSelection.length >= 1)
        //     analytics.trackTagFilter()
    }

    isActive = (tagID) => {
        return _.includes(tagStore.tagSelection, tagID)
    }

    clearRow = () => {
        const tagIDs = this.props.rowOfTags
        tagStore.popTags(tagIDs)
    }

    render = () => {
        const tagIDs = this.props.rowOfTags.filter(tagStore.tagIsDefined)
        return <ButtonRow
                rowNumber={this.props.rowNumber}
                clearRow={this.clearRow}
                >
            <ButtonGroup
                labels={tagIDs}
                showBar={false}
                renderLabel={tagStore.getTagName}
                toggleButton={this.toggleButton}
                isActive={this.isActive}
                isDisabled={() => false /* this.isActive */} /* disable toggle */
                />
        </ButtonRow>
    }
}