import { observable, computed, transaction, action, autorun } from 'mobx'
import { Map, mapCreate } from '~/src/utils/map.js'

import { barStore } from './barstore.js'
import { downloadManager } from '~/src/network/http.js'
import { TagsDownload } from '~/src/network/api/bar/tags.js'
import { analytics } from '~/src/model/analytics.js'
import { config } from '~/src/utils/config.js'
import * as _ from '~/src/utils/curry.js'

const { log, assert } = _.utils('./model/tagstore.js')

export type TagRows = {
    rows: Array<Array<TagID>>,
    menuItems: Array<MenuItem>,
}

/* Root tags: beer, wine, spirits, cocktails, water, ... */
export const rootIDs = [ '#beer', '#wine', '#spirit', '#cocktail', '#water' ]

export class TagStore {
    /*
        A tag like #beer is given a unique stamp:

            TagID   = int
            TagName = str
            Tag     = (TagID, str) // (0x38AF19, '#beer')

        tagGraph: {TagID: [TagID]}
            is a graph where the nodes are tags, and the edges
            between tags indicate valid user choices.

        tagSelection: [TagID]
            tagSelection is a list of selected tags

        tagSelectionHistory: {TagID: [TagID]}
            constitutions the history of choices that are
            active. For example:

                tagNames = { 0: '#beer', 14: '#stout', 20: '#dark', 21: '#dry' }
                tagSelectionHistory = { 0: [14], 14: [20, 21] }

            This remembers that #stout was selected under #beer, and that
            #dark and #dry were selected under #stout.

        tagNames: {TagID: TagName}
            tag name from TagID, e.g. { 0: '#beer' }

        tagExcludes: {TagID: [TagID]}
            is a mapping from tags to a list of other tags excluded
            by that tag. E.g.

                tagNames    = { 15: '#red', 16: '#white' }
                tagExcludes = { 15, [16],   16, [15] }

            That is, under #wine, the tag #red would exclude
            the tag #white and vice-versa.

    */

    @observable tagSelection : Array<TagID> = null
    @observable asyncTagSelection = null /* synced asynchronously with 'tagSelection' */

    @observable tagsDownload : TagsDownlaod = null

    constructor() {
        this.tagSelection        = []
        this.tagSelectionHistory = new Map()
    }

    /*********************************************************************/
    /* State                                                             */
    /*********************************************************************/

    getState = () => {
        return {
            tagSelection: this.tagSelection,
        }
    }

    emptyState = () => {
        return {
            tagSelection: [],
        }
    }

    @action setState = (tagState) => {
        if (Array.isArray(tagState.tagSelection)) {
            this.tagSelection = tagState.tagSelection
            // analytics.trackTagFilter()
        }
    }

    /*********************************************************************/
    /* Tags Download                                                     */
    /*********************************************************************/

    @action initialize = () => {
        downloadManager.declareDownload(new TagsDownload(this.getDownloadProps))
    }

    getDownloadProps = () => {
        return {
            barID: barStore.barID,
        }
    }

    @computed get tags() {
        return downloadManager.getDownload('tags').tags
    }

    /*********************************************************************/
    /* Tags                                                              */
    /*********************************************************************/

    @computed get tagGraph() {
        if (!this.tags)
            return new Map()
        return new Map(this.tags.tagGraph.map(
            edge => [edge.srcID, edge.dstIDs]
        ))
    }

    @computed get tagNames() {
        const tagNames = this.tags.tagInfo.map(
            tagInfo => [tagInfo.tagID, tagInfo.tagName])
        return new Map(tagNames)
    }

    getTagExcludes = () => {
        const tagExcludes = this.tags.tagInfo.map(tagInfo =>
            [tagInfo.tagID, tagInfo.excludes])
        return new Map(tagExcludes)
    }

    @computed get activeMenuItems() {
        return filterMenuItems(barStore.allMenuItems, this.tagSelection)
    }

    /* Get the rows of tags that should be visible to the user */
    @computed get visibleTagRows() : TagRows {
        /* Get all applicable tags */
        const childRow = (parentRow) => {
            const selected = _.intersection(parentRow, tagStore.tagSelection)
            const childRow = _.flatten(selected.map(tagStore.getChildren))
            return childRow.filter(tagID => isEnabled(tagID, menuItems))
        }

        let menuItems = barStore.allMenuItems
        let parentRow = rootIDs
        let rows = []
        while (parentRow.length > 0) {
            rows.push(parentRow)
            row = childRow(parentRow)
            /* Filter out any menu items that do not match the selected tags */
            tagSelection = _.intersection(tagStore.tagSelection, row)
            menuItems = filterMenuItems(menuItems, tagSelection)
            parentRow = row
        }
        return { rows: rows, menuItems: menuItems }
    }


    getExcludedTags = (tagID) => {
        /* Figure out which tags should be excluded */
        const excludes = this.getTagExcludes().get(tagID) || []
        return this.tagSelection.filter(
            (tagID) => _.includes(excludes, tagID))
    }

    matchMenuItem = (menuItem) => {
        return matchMenuItem(menuItem, this.tagSelection)
    }

    /* Push a new tag when selected by the user */
    pushTag = (tagID) => {
        if (_.includes(this.tagSelection, tagID)) {
            /* Tag already included, all done */
            analytics.trackTagFilter()
            return
        }

        const excluded = this.getExcludedTags(tagID)

        /* Get the set of reachable tags for each of the excluded tags */
        const reachableExcluded = excluded.map(this._findReachable)

        /* Save the history for each excluded tag */
        excluded.forEach((excludedTagID, i) => {
            const reachableTags = reachableExcluded[i]
            this._saveExcludedTag(excludedTagID, reachableTags)
        })
        /* Remove all excluded tags and their descendents */

        transaction(() => {
            this._clearTags(_.flatten(reachableExcluded))
            this.tagSelection.push(tagID)
            // this._restoreHistory(tagID)
        })

        analytics.trackTagFilter()

        // log("excluded:", excluded)
        // log("reachableExcluded:", reachableExcluded)
        // log("New tag selection:", this.tagSelection)
        // log("New menu item list", this.getActiveMenuItems().map(menuItem => menuItem.name))
    }

    /* Pop a tag when deselected/cleared */
    popTag = (tagID) => {
        const reachableTags = this._findReachable(tagID)
        this._clearTags(reachableTags)
    }

    popTags = (tagIDs) => {
        transaction(() => {
            tagIDs.forEach(this.popTag)
        })
    }

    getChildren = (tagID) => {
        let result = this.tagGraph.get(tagID)
        if (!result)
            result = []
        return result
    }

    getTagName = (tagID) => {
        const tagName = this.tagNames.get(tagID)
        return tagName && tagName.slice(1)
    }

    tagIsDefined = (tagID : TagID) : Bool => {
        return this.tagNames.has(tagID)
    }

    _clearTags = (tagIDs) => {
        this.tagSelection = this.tagSelection.filter(
            (tagID) => !_.includes(tagIDs, tagID))
    }

    /* Save excluded tag in history for when it is re-selected */
    _saveExcludedTag = (excludedTagID, reachableTags) => {
        const tagSubSelection = _.intersection(reachableTags, this.tagSelection)
        this.tagSelectionHistory.set(excludedTagID, tagSubSelection)
    }

    /* Restore history */
    _restoreHistory = () => {
        transaction(() => {
            const tagsFromHistory = this.tagSelectionHistory.get(tagID)
            if (tagsFromHistory) {
                /* Restore previous selection from history */
                tagsFromHistory.forEach((tagID) => { this.tagSelection.push(tagID) })
            } else {
                /* No history available, push only the tag */
                this.tagSelection.push(tagID)
            }

        })
    }

    /* Find all reachable tag IDs from the given tag ID */
    _findReachable = (tagID) => {
        const result = []
        const reachable = (tagID) => {
            result.push(tagID)
            this.getChildren(tagID).forEach(reachable)
        }
        reachable(tagID)
        return result
    }
}

/* Check if the given menuItem has the given tag */
const hasTag = (menuItem, tagID) => _.includes(menuItem.tags, tagID)

const filterMenuItems = (menuItems, tagSelection) => {
    return menuItems.filter(menuItem => matchMenuItem(menuItem, tagSelection))
}

const matchMenuItem = (menuItem, tagSelection) => {
    return _.all(
        tagSelection.map(tagID => hasTag(menuItem, tagID))
    )
}

/* Check if at least one but not all of the given menu items has the given tag */
const isEnabled = (tagID, menuItems) => {
    const haveTag = menuItems.map(menuItem => hasTag(menuItem, tagID))
    return _.any(haveTag) && !_.all(haveTag)
}

/*********************************************************************/
/* Setup Store                                                       */
/*********************************************************************/

export const tagStore = new TagStore()

autorun(() => {
    tagStore.tagSelection
    setTimeout(() => tagStore.asyncTagSelection = tagStore.tagSelection, 0)
})
