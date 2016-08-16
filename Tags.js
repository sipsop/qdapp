import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import { observable, computed, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'

import { ButtonRow, ButtonGroup } from './ButtonRow.js'
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

/* Root tags: beer, wine, spirits, cocktails, water, ... */
export const rootIDs = [ '0', '1', '2', '3', '4' ]

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
                try {
                    this.tagDownloadResult = downloadResult.update(data => data.menuTags)
                } catch (err) {
                    console.error(err)
                }
            })
            .catch((error) => {
                this.tagDownloadResult.downloadError(error.message)
            })
    }

    @computed get tags() {
        return this.tagDownloadResult.value
    }

    @computed get tagGraph() {
        const result = new Map()
        const edges = this.tags.tagGraph.forEach((edge) => {
            if (!result.has(edge.srcID))
                result.set(edge.srcID, [])
            const dstIDs = result.get(edge.srcID)
            dstIDs.push(edge.dstID)
        })
        return result
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

    // @computed get allMenuItems() {
    @computed get allMenuItems() {
        const menu  = store.bar.value.menu
        const subMenus = (
            [ menu.beer
            , menu.wine
            , menu.spirits
            , menu.cocktails
            , menu.water
            // , menu.snacks
            // , menu.food
            ])
        const menuItems = subMenus.map((subMenu) => subMenu.menuItems)
        return _.flatten(menuItems)
    }

    getActiveMenuItems = () => {
        return filterMenuItems(this.allMenuItems, this.tagSelection)
    }

    getExcludedTags = (tagID) => {
        /* Figure out which tags should be excluded */
        const excludes = this.getTagExcludes().get(tagID)
        return this.tagSelection.filter(
            (tagID) => _.includes(excludes, tagID))
    }

    /* Push a new tag when selected by the user */
    pushTag = (tagID) => {
        console.log("Pushing tag...", tagID, this.tagSelection)
        if (_.includes(this.tagSelection, tagID)) {
            /* Tag already included, all done */
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

        // console.log("excluded:", excluded)
        // console.log("reachableExcluded:", reachableExcluded)
        // console.log("New tag selection:", this.tagSelection)
        // console.log("New menu item list", this.getActiveMenuItems().map(menuItem => menuItem.name))
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
        var result = this.tagGraph.get(tagID)
        if (!result)
            result = []
        return result
    }

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
    return menuItems.filter(
        menuItem => all(
            tagSelection.map(tagID => hasTag(menuItem, tagID))
        )
    )
}

/* Check if at least one but not all of the given menu items has the given tag */
const isEnabled = (tagID, menuItems) => {
    const haveTag = menuItems.map(menuItem => hasTag(menuItem, tagID))
    return any(haveTag) && !all(haveTag)
}

@observer
export class TagView extends DownloadResultView {

    constructor(props) {
        super(props, "Error downloading tags")
    }

    @computed get rows() {
        /* Get all applicable tags */
        const childRow = (parentRow) => {
            const selected = _.intersection(parentRow, tagStore.tagSelection)
            const childRow = _.flatten(selected.map(tagStore.getChildren))
            return childRow.filter(tagID => isEnabled(tagID, menuItems))
        }

        var menuItems = tagStore.allMenuItems
        var parentRow = rootIDs
        var rows = []
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

    getAllExcludedTags() {
        // return _.union(_.flatten(tagStore.tagSelection.map(tagStore.tagExcludes.get)))
    }

    getDownloadResult = () => tagStore.tagDownloadResult
    refreshPage = () => tagStore.fetchTags()
    renderNotStarted = () => <View />

    renderFinished = (tags) => {
        // const menuItems = tagStore.getAllMenuItems()
        // return <View>
        //     {menuItems.map((menuItem, i) => <T key={i}>{menuItem.name + ": " + menuItem.tags}</T>)}
        // </View>
        const { rows, menuItems } = this.rows

        console.log("Got rows:", rows)
        console.log(tags)

        const excludedTags = this.getAllExcludedTags()

        return <View>
            {/*
            <ButtonRow labelGroups={[['beer', 'wine', 'cocktails', 'spirits', 'water', 'snacks', 'food']]} index={0} />
            <ButtonRow labelGroups={[['stout', 'lager'], ['tap', 'bottle']]} index={1} />
            <ButtonRow labelGroups={[['fruity', 'chocolate', 'pale', 'dark', 'hops']]} index={2} />
            */}
            {rows.map((rowOfTags, i) =>
                <TagRow
                    key={i}
                    rowNumber={i}
                    rowOfTags={rowOfTags}
                    menuItems={menuItems}
                    isExcluded={tagID => false}
                    /*isExcluded={tagID => _.includes(excludedTags, tagID)}*/
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

    toggleButton = (tagID) => {
        if (this.isActive(tagID)) {
            tagStore.popTag(tagID)
        } else {
            tagStore.pushTag(tagID)
        }
    }

    isActive = (tagID) => {
        return _.includes(tagStore.tagSelection, tagID)
    }

    isEnabled = (tagID) => {
        // TODO: Check whether the button would have a "useful" effect
        // (i.e. produce a distinct, non-empty list)
        return true
    }

    clearRow = () => {
        const tagIDs = this.props.rowOfTags
        tagStore.popTags(tagIDs)
    }

    render = () => {
        const tagIDs = this.props.rowOfTags
        const tagNames = tagIDs.map(tagStore.getTagName)
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
                isDisabled={tagID => !this.isEnabled(tagID)}
                />
        </ButtonRow>
    }
}

export const tagStore = new TagStore()
tagStore.fetchTags()
