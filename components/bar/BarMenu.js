import {
    View,
    Dimensions,
    PureComponent,
} from '~/components/Component.js'
import { observer } from 'mobx-react/native'

import type { String, URL } from '../Types.js'

import { CardRow } from './CardRow'

export type Category = {
    title: String,
    url: URL,
}

const menuPadding = 5

@observer
export class BarMenu extends PureComponent {
    /* properties:
        menu: Menu
    */

    render = () => {
        const menu = this.props.menu
        const rows =
                [ [ { name: 'Beer', tag: '#beer', submenu: menu.beer },
                   { name: 'Wine', tag: '#wine', submenu: menu.wine }
                  ],
                 [ { name: 'Spirits', tag: '#spirit', submenu: menu.spirits },
                   { name: 'Cocktails', tag: '#cocktail', submenu: menu.cocktails }
                  ],
                 [ { name: 'Water', tag: '#water', submenu: menu.water },
                   { name: 'Snacks', tag: '#snack', submenu: menu.snacks }
                  ]
                //   , { name: "Food", tag: '#food', submenu: menu.food }
                //   ]
                ]
        return (
            <View
                style={{ justifyContent: 'center',
                         alignItems: 'center',
                         marginLeft: menuPadding,
                         marginRight: menuPadding
                      }}
                    >
                { rows.map(this.renderRow) }
            </View>
        )
    }

    renderRow = (row, i) => {
        const { width } = Dimensions.get('window')
        return <CardRow key={i} row={row} rowWidth={width - menuPadding * 2} />
    }

}
