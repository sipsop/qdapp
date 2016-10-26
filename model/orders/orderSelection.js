import * as _ from '~/utils/curry.js'

export const addToSelection = (optionType : OptionType, selection : [String], option : String) => {
    newSelection = selection.slice()
    addToSelectionInPlace(optionType, newSelection, option)
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

export const addToSelectionInPlace = (optionType : OptionType, selection : [String], option : String) => {
    if (optionType === 'Single') {
        if (selection.length === 1)
            selection[0] = option
        else
            selection.push(option)
    } else if (optionType === 'AtMostOne') {
        if (_.includes(selection, option))
            removeOption(selection, option)
        else
            addToSelectionInPlace('Single', selection, option)
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
