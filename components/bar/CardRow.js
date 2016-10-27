import { observer } from 'mobx-react/native'
import { React, PureComponent } from '~/components/Component'
import { Card } from './Card'

@observer
export class CardRow extends PureComponent {
    /* properties:
        row: [{name: str, tag: str, submenu: SubMenu}]
            list of submenus to show in a row
        rowWidth: int
    */
    render = () => {
        return (<View style={{ flexDirection: 'row',
                     justifyContent: 'space-around'
                    }}>
                {this.props.row.map(this.renderSubMenu)}
            </View>
        )
    }

    renderSubMenu = (item, i) => {
        const margin = 5
        const cardSpace = this.props.rowWidth - 4 * margin
        const cardWidth = cardSpace / 2
        // Sanity check
        if (!cardWidth) {
            throw Error(this.props.rowWidth)
        }
        return (<Card
                    key={i}
                    name={item.name}
                    tag={item.tag}
                    submenu={item.submenu}
                    style={{ margin: margin,
                             width: cardWidth,
                             height: cardWidth
                           }}
                    />)
    }
}
