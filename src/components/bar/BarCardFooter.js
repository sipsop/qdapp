import { React, View, PureComponent } from '/components/Component'
import { observer } from 'mobx-react/native'

import { PlaceInfo } from '../PlaceInfo'
import { BarName } from './BarName'
import { TimeInfo } from '../TimeInfo'
import { Distance } from '../Distance'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils(__filename)

assert(PlaceInfo)
assert(BarName)
assert(TimeInfo)
assert(Distance)

@observer
export class BarCardFooter extends PureComponent {
    /* properties:
        bar: schema.Bar
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
    */

    static defaultProps = {
        showDistance: false,
        showTimeInfo: true,
        showBarName: true,
        showMapButton: true
    }

    render = () => {
        const bar = this.props.bar
        return (<View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
            <View style={{flex: 1, marginLeft: 5, flexWrap: 'wrap'}}>
                <View style={{flexDirection: 'row'}}>
                    {this.props.showTimeInfo && <TimeInfo bar={bar} />}
                    {this.props.showDistance && <Distance bar={bar} />}
                </View>
                {this.props.showBarName && <BarName barName={bar.name} />}
            </View>
            {
                this.props.showMapButton &&
                <View style={{justifyContent: 'flex-end', marginRight: 5}}>
                    <PlaceInfo bar={bar} />
                </View>
            }
            </View>
        )
    }
}
