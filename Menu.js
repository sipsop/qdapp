import { Dict, SimpleDict, List, Tuple, MaybeNone, Optional
       , ForwardRef, Alias, Enum, DataType, Case
       , BasicType, BasicTypes
       } from "./Typing.jsx"

export const Price = new Alias('Price', BasicTypes.float)

export const DrinkID = new Alias('DrinkID', BasicTypes.str)

export const URL = new Alias('URL', BasicTypes.str)

export const MenuItem = new Dict([
    ['drinkID', DrinkID],
    ['name', BasicTypes.str],
    ['image', URL],
    ['desc', BasicTypes.str],
    ['tags', new List(BasicTypes.str)],
    ['drinkSizes', new List(BasicTypes.str)],
    ['drinkSizePrices', new List(Price)],
    ['drinkOpts', new List(new List(BasicTypes.str))],
    ['drinkOptsPrices', new List(new List(Price))],
])

export const Category = new Enum('Category', ['Beer', 'Wine', 'Spirits', 'Cocktails'])

export const Menu = new Dict([
    ['items', new SimpleDict(Category, MenuItem)],
])

export const Menu = new Dict(Category, MenuItem)

// export class MenuItem {
//     @observable name
//     @observable description
//     @observable tags
//     @observable drinkSizes
//     @observable drinkSizePrices
//     @observable drinkOpts
//     @observable drinkOptsPrices
//
//     constructor(drinkID, name, image, description, tags, drinkSizes, drinkSizePrices, drinkOpts, drinkOptsPrices) {
//         this.drinkID = drinkID
//         this.name = name
//         this.image = image
//         this.description = description
//         this.tags = tags
//         this.drinkSizes = drinkSizes
//         this.drinkSizePrices = drinkSizePrices
//         this.drinkOpts = drinkOpts
//         this.drinkOptsPrices = drinkOptsPrices
//     }
// }
