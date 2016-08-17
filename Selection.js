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
    if (optionType === 'Single') {
        if (newSelection.length === 1)
            newSelection[0] = index
        else
            newSelection.push(index)
    } else if (optionType === 'ZeroOrMore' || optionType === 'OneOrMore') {
        if (index != undefined)
            newSelection.push(index)
    } else {
        throw Error("Unknown option type: " + optionType)
    }
    return newSelection
}

/* selectionFromFlags : [Flag] -> Selection */
/*
export const selectionFromFlags = (flags) => {
    const result = []
    flags.forEach((flag, itemIndex) => {
        if (flag.get()) {
            result.push(itemIndex)
        }
    })
    return result
}
*/

/* selectionAsFlags : Int -> [Flag] */
export const getFlags = (n) => {
    return _.range(n).map(i => new Flag())
}

/* updateFlagsInPlace : Selection -> [Flag] -> void */
export const updateFlagsInPlace = (selection, flags) => {
    transaction(() => {
        flags.forEach(flag => flag.set(false))
        selection.forEach(itemIndex => flags[itemIndex].set(true))
    })
}

/* Class holding a single boolean flag */
export class Flag {
    @observable flag = false

    get = () => this.flag

    set = (flag) => {
        this.flag = flag
    }

    toggle = () => {
        this.flag = !this.flag
    }
}
