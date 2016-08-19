/*
Deal with item selection as a list of selected indices and as a list of
flags. The list of selected indices is easier to deal with, but the list
of flags allows efficient item rendering. For example, when you select
item 59 out of 100 items, you only want to re-render item 59 and not all
the other items.
*/

import { observable, computed, autorun, transaction } from 'mobx'
import _ from 'lodash'

/* type Index = Int */
/* type Selection = [Index] */

/* updateSelection: schema.OptionType -> Selection -> Index -> Selection */
export const updateSelection = (optionType, selection, index) => {
    newSelection = selection.slice()
    updateSelectionInPlace(optionType, newSelection, index)
    return newSelection
}

export const updateSelectionInPlace = (optionType, selection, index) => {
    if (optionType === 'Single') {
        if (selection.length === 1)
            selection[0] = index
        else
            selection.push(index)
    } else if (optionType === 'ZeroOrMore' || optionType === 'OneOrMore') {
        selection.push(index)
    } else {
        throw Error("Unknown option type: " + optionType)
    }
}
