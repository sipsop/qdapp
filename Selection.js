/*
Deal with item selection as a list of selected indices and as a list of
flags. The list of selected indices is easier to deal with, but the list
of flags allows efficient item rendering. For example, when you select
item 59 out of 100 items, you only want to re-render item 59 and not all
the other items.
*/

import { observable, computed, autorun, transaction } from 'mobx'
import * as _ from './Curry.js'

/* type Index = Int */
/* type Selection = [Index] */

/* updateSelection: schema.OptionType -> Selection -> Index -> Selection */
export const updateSelection = (optionType : OptionType, selection : [String], option : String) => {
    newSelection = selection.slice()
    updateSelectionInPlace(optionType, newSelection, option)
    return newSelection
}

export const canDeselect = (optionType : OptionType, selection : [String]) => {
    if (optionType === 'Single')
        return false
    if (optionType === 'OneOrMore')
        return selection.length > 1
    return true
}

export const removeOption = (selection : [String], option : String) => {
    const i = _.find(selection, option)
    selection.splice(i, 1)
}

export const updateSelectionInPlace = (optionType : OptionType, selection : [String], option : String) => {
    if (optionType === 'Single') {
        if (selection.length === 1)
            selection[0] = option
        else
            selection.push(option)
    } else if (optionType === 'AtMostOne') {
        if (_.includes(selection, option))
            removeOption(selection, option)
        else
            updateSelectionInPlace('Single', selection, option)
    } else if (optionType === 'ZeroOrMore' || optionType === 'OneOrMore') {
        if (canDeselect(optionType, selection) && _.includes(selection, option)) {
            removeOption(selection, option)
        } else {
            selection.push(option)
        }
    } else {
        throw Error("Unknown option type: " + optionType)
    }
}
