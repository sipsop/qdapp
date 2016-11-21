import { computed, transaction, action, autorun } from 'mobx'
import { BarQueryDownload } from './barquery'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/network/api/bar/menu')

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
export const MenuItemQuery = {
    id:         'String',
    name:       'String',
    desc:       'String',
    images:     ['String'],
    abv:        'String',
    year:       'Int',
    tags:       ['String'],
    price:      PriceQuery,
    options:    [MenuItemOptionQuery],
}

export class MenuDownload extends BarQueryDownload {
    name = 'menu'

    @computed get query() {
        return {
            fragments: {
                SubMenu: {
                    image:      'String',
                    menuItems:  [MenuItemQuery],
                },
            },
            Menu: {
                args: {
                    barID: this.props.barID,
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

    // finish() {
    //     super.finish()
    //     log("FINISHED MENU DOWNLOAD with VALUE", this.value)
    // }
}
