import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import Dimensions from 'Dimensions'
import _ from 'lodash'
import { observable, computed, transaction } from 'mobx'
import { observer } from 'mobx-react/native'
import { Map, mapCreate } from './Map.js'

const tagQuery = `
    query tags {
        tagInfo {
            id
            tagName
            excludes
        }
        tagGraph {
            srcID
            dstID
        }
    }
`

class TagList {
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

    @observable tagDownloadResult = null
    @observable tagSelection      = null

    constructor() {
        this.tagDownloadResult   = emptyResult()
        this.tagSelection        = []
        this.tagSelectionHistory = new Map()
        this.fetchTags()
    }

    fetchTags = () => {
        this.tagDownloadResult.downloadStarted()
        graphQL(tagQuery)
            .then(this.tagDownloadResult.downloadFinished)
            .catch((error) => {
                this.tagDownloadResult.downloadError(error.message)
            })
    }

    @computed get tags() {
        return this.downloadResult.value.tags
    }

    @computed get tagGraph() {
        const edges = this.tags.tagGraph.map((edge) => [edge.srcID, edge.dstID])
        return new Map(edges)
    }

    @computed get tagNames() {
        const tagNames = this.tags.tagInfo.map(
            tagInfo => [tagInfo.id, tagInfo.tagName])
        return new Map(tagNames)
    }

    @computed get tagExcludes() {
        const tagExcludes = this.tags.tagInfo.map(tagInfo =>
            [tagInfo.id, tagInfo.excludes])
        return new Map(tagExcludes)
    }

    pushTag = (tagID) => {
        if (_.includes(this.tagSelection, tagID)) {
            /* Tag already included, all done */
            return
        }
        const excludes = this.tagExcludes.get(tagID)

        // Find excluded tags and save them in the tagSelectionHistory
        this.tagSelection.filter((tagID) => _.includes(excludes, tagID))
                         .forEach((tagID) => this.excludeTag(tagID))

        // Update tag selection
        this.tagSelection = this.tagSelection
                        .filter((tagID) => !_.includes(excludes, tagID))
    }

    /* Save excluded tag in history for when it is re-selected */
    saveExcludedTag = (excludedTagID) => {
        const reachableTags = this.findReachable(excludedTagID)
        const tagSubSelection = _.intersection(reachableTags, this.tagSelection)
        this.tagSelectionHistory.set(excludedTagID, tagSubSelection)
    }

    /* Find all reachable tag IDs from the given tag ID */
    findReachable = (tagID) => {
        const result = []
        const reachable = (tagID) => {
            
        }
    }

    _setRootTag = (tag) => {
        this.tagSelection = [[tag]]
    }

    /* Truncate selection at 'tag' */
    truncateSelect = (tag) => {

    }
}

@observer
export class TagView extends Component {
    render = () => <View />
}
