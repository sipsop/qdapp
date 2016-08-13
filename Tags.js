import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import { observable, computed, transaction } from 'mobx'
import { observer } from 'mobx-react/native'

import { T } from './AppText.js'
import { Map, mapCreate } from './Map.js'
import { store } from './Store.js'
import { DownloadResult, DownloadResultView, emptyResult, graphQL } from './HTTP.js'
import { all, any } from './Curry.js'

const tagQuery = `
    query tags {
        menuTags {
            tagInfo {
                tagID
                tagName
                excludes
            }
            tagGraph {
                srcID
                dstID
            }
        }
    }
`

export const roots =
    [ ('0', '#beer')
    , ('1', '#wine')
    , ('2', '#spirits')
    , ('3', '#cocktails')
    , ('4', '#water')
    // , ('5', '#soda')
    // , ('6', '#snacks')
    // , ('7', '#food')
    ]

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

    /* DownloadResult[ schema.Tags ] */
    @observable tagDownloadResult = null
    /* [TagID] */
    @observable tagSelection      = null

    constructor() {
        this.tagDownloadResult   = emptyResult()
        this.tagSelection        = ['0']
        this.tagSelectionHistory = new Map()
    }

    fetchTags = () => {
        this.tagDownloadResult.downloadStarted()
        graphQL(tagQuery)
            .then((downloadResult) => {
                // console.log("//=========================================\\")
                // console.log("Downloaded tags:", downloadResult.value)
                // console.log("\\=========================================//")
                this.tagDownloadResult = downloadResult.update(data => data.menuTags)
            }).catch((error) => {
                this.tagDownloadResult.downloadError(error.message)
            })
    }

    @computed get tags() {
        return this.tagDownloadResult.value
    }

    @computed get tagGraph() {
        const edges = this.tags.tagGraph.map((edge) => [edge.srcID, edge.dstID])
        return new Map(edges)
    }

    @computed get tagNames() {
        const tagNames = this.tags.tagInfo.map(
            tagInfo => [tagInfo.tagID, tagInfo.tagName])
        return new Map(tagNames)
    }

    @computed get tagExcludes() {
        const tagExcludes = this.tags.tagInfo.map(tagInfo =>
            [tagInfo.tagID, tagInfo.excludes])
        return new Map(tagExcludes)
    }

    // @computed get allMenuItems() {
    getAllMenuItems = () => {
        const menu  = store.bar.value.menu
        const subMenus = (
            [ ['#beer', menu.beer]
            , ['#wine', menu.wine]
            , ['#spirits', menu.spirits]
            , ['#cocktails', menu.cocktails]
            , ['#water', menu.water]
            // , menu.snacks
            // , menu.food
            ])
        const menuItems = subMenus.map((item) => {
            const tag = item[0]
            const subMenu = item[1]
            return subMenu.menuItems.map(menuItem => {
                menuItem.tags.push(tag)
                return menuItem
            })
        })

        return _.flatten(menuItems)
    }

    /* Push a new tag when selected by the user */
    pushTag = (tagID) => {
        if (_.includes(this.tagSelection, tagID)) {
            /* Tag already included, all done */
            return
        }

        /* Figure out which tags should be excluded */
        const excludes = this.tagExcludes.get(tagID)
        const excluded = this.tagSelection.filter(
            (tagID) => _.includes(excludes, tagID))

        /* Get the set of reachable tags for each of the excluded tags */
        const reachables = excluded.map(this._findReachable)

        /* Save the history for each excluded tag */
        excluded.forEach((excludedTagID, i) => {
            const reachableTags = reachables[i]
            this._saveExcludedTag(exlcudedTagID, reachableTags)
        })
        /* Remove all excluded tags and their descendents */
        this._clearTags(_.union(reachables))

        /* TODO: Restore history */
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

    getChildren = (tagID) => this.tagGraph.get(tagID)

    getTagName = (tagID) => this.tagNames.get(tagID)

    _clearTags = (tagIDs) => {
        this.tagSelection = this.tagSelection.filter(
            (tagID) => !_.includes(tagIDs, tagID))
    }

    /* Save excluded tag in history for when it is re-selected */
    _saveExcludedTag = (excludedTagID, reachableTags) => {
        const tagSubSelection = _.intersection(reachableTags, this.tagSelection)
        this.tagSelectionHistory.set(excludedTagID, tagSubSelection)
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

@observer
export class TagView extends DownloadResultView {

    constructor(props) {
        super(props, "Error downloading tags")
    }

    // @computed get rows() {
    getRows = () => {
        /* Check if the given menuItem has the given tag */
        const hasTag = (menuItem, tagID) => _.includes(menuItem.tags, tagID)

        /* Check if one of the given menu items has the given tag */
        const someItemHasTag = (menuItems, tagID) =>
            _.find(menuItems, menuItem => hasTag(menuItem, tagID))

        /* Get all applicable tags */
        const childRow = (parentRow) => {
            const selected = _.intersection(parentRow, tagSelection)
            const childRow = _.union(selected.map(tagStore.getChildren))
            return childRow.filter(someItemHasTag)
        }

        /* Filter out any menu items that do not match the selected tags */
        filterSelection = (childRow, menuItems) => {
            tagSelection = _.intersection(tagStore.tagSelection, parentRow)
            menuItems = menuItems.filter(
                menuItem => all(
                    tagSelection.map(tagID => hasTag(menuItem, tagID))
                )
            )
        }

        var menuItems = tagStore.getAllMenuItems()
        var parentRow = roots.map(root => root[0])
        var rows = []
        while (parentRow.size > 0) {
            rows.push(parentRow)
            row = childRow(parentRow)
            menuItems = filterSelection(row, menuItems)
            parentRow = row
        }
        return { rows: rows, menuItems: menuItems }
    }

    getDownloadResult = () => tagStore.tagDownloadResult
    refreshPage = () => tagStore.fetchTags()
    renderNotStarted = () => <View />

    renderFinished = (tags) => {
        // const menuItems = tagStore.getAllMenuItems()
        // return <View>
        //     {menuItems.map((menuItem, i) => <T key={i}>{menuItem.name + ": " + menuItem.tags}</T>)}
        // </View>
        const { rows, menuItems } = this.getRows()

        console.log("Got rows:", rows)

        return <View>
            <T>Tags here!</T>
            {rows.map((rowOfTags, i) =>
                <TagRow key={i} rowOfTags={rowOfTags} />
                )
            }
        </View>
    }

}

@observer
export class TagRow extends Component {
    /* properties:
        rowOfTags: [TagID]
    */
    render = () => {
        const tags = this.props.rowOfTags
        return <View style={{flex: 1, flexDirection: 'row'}}>
            {tags.map(
                (tagID, i) =>
                    <T key={i}>
                        {tagStore.getTagName(tagID)}
                    </T>
                )
            }
        </View>
    }
}

export const tagStore = new TagStore()
tagStore.fetchTags()
