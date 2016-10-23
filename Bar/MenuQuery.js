export const PriceQuery = {
    currency:   'String',
    option:     'String',
    price:      'Int',
}

export const MenuItemOptionQuery = {
    id:             'String',
    name:           'String',
    optionType:     'String',
    optionList:     ['String'],
    prices:         [PriceQuery],
    defaultOption:  'Int',
}

/* qdserver.model.MenuItemDef */
const _MenuItemQuery = {
    id:         'String',
    name:       'String',
    desc:       'String',
    images:     ['String'],
    abv:        'String',
    year:       'Int',
    tags:       ['String'],
    price:      PriceQuery,
}

export const MenuItemQuery = {
    ..._MenuItemQuery,
    options:    [MenuItemOptionQuery],
}

// export const MenuItemSlimQuery = {
//     ..._MenuItemQuery,
//     optionsID:  'String',
// }

export const getMenuQuery = (barID) => {
    return {
        fragments: {
            SubMenu: {
                image:      'String',
                menuItems:  [MenuItemQuery],
            },
        },
        Menu: {
            args: {
                barID: barID,
            },
            result: {
                beer:               'SubMenu',
                wine:               'SubMenu',
                spirits:            'SubMenu',
                cocktails:          'SubMenu',
                water:              'SubMenu',
                snacks:             'SubMenu',
                food:               'SubMenu',
            }
        }
    }
}
