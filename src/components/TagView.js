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
import { store, tagStore } from '/model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils(__filename)

@observer
export class TagView extends PureComponent {
    /* properties:
        children: [Component]
        onTagChange: () => void
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
                    onTagChange={this.props.onTagChange}
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
        onTagChange: () => void
    */

    @action toggleButton = (tagID) => {
        if (this.isActive(tagID)) {
            tagStore.popTag(tagID)
        } else {
            /* Scroll to top of page and reset the number of visible rows */
            store.switchToMenuPage(scrollToTop = true)
            /* NOTE: Do this async, so that we first scroll to top smoothly, and
                     then re-render only the first few menu items
            */
            setTimeout(() => tagStore.pushTag(tagID), 0)
        }
        // if (tagStore.tagSelection.length >= 1)
        //     analytics.trackTagFilter()
        this.props.onTagChange()
    }

    isActive = (tagID) => {
        return _.includes(tagStore.tagSelection, tagID)
    }

    clearRow = () => {
        const tagIDs = this.props.rowOfTags
        tagStore.popTags(tagIDs)
        this.props.onTagChange()
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
