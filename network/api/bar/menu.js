import { computed, transaction, action, autorun } from 'mobx'
import { BarQueryDownload } from './barquery.js'
import { config } from './Config.js'

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
}
