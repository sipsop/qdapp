import React, { Component } from 'react';
import {
    View,
    TouchableOpacity,
} from 'react-native'
import { observable, computed, transaction, action, autorun } from 'mobx'
import { observer } from 'mobx-react/native'

import { ButtonRow, ButtonGroup } from './ButtonRow.js'
import { T } from '~/components/Component.js'
import { DownloadResultView, downloadManager } from '~/network/http'
import { analytics } from './model/analytics.js'
import { tagstore } from '~/model/tagstore.js'
import * as _ from './utils/curry.js'

const { log, assert } = _.utils('./components/tags.js')

@observer
export class TagView extends DownloadResultView {
    /* properties:
        children: [Component]
    */

    errorMessage = "Error downloading tags"

    getDownloadResult = () => downloadManager.getDownload('tags')
    refreshPage = async () => await downloadManager.forceRefresh('tags')
    renderNotStarted = () => <View />

    renderFinished = (tags) => {
        // const menuItems = tagStore.getAllMenuItems()
        // return <View>
        //     {menuItems.map((menuItem, i) => <T key={i}>{menuItem.name + ": " + menuItem.tags}</T>)}
        // </View>
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
