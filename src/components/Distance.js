import { React, View, PureComponent, T } from '/components/Component'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { mapStore } from '/model/store'
import * as _ from '/utils/curry'

const { log, assert } = _.utils('/components.Distance')
const timeTextStyle = {fontSize: 11, color: '#fff'}

const formatDistance = (dist) => {
    if (dist < 0) {
        return 'unknown'
    }
    if (dist < 1000) {
        const meters = Math.round(dist / 100) * 100
        return `${meters.toFixed(0)} meters`
    }
    const km = dist / 1000
    return `${km.toFixed(1)}km`
}

@observer
export class Distance extends PureComponent {
    /* properties:
        bar: Bar
    */

    @computed get distance () {
        return mapStore.distanceFromUser(this.props.bar)
    }

    @computed get distanceString () {
        return formatDistance(this.distance)
    }

    render = () => {
        return (
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Icon name="location-arrow" size={15} color='#fff' />
                <View style={{marginLeft: 5, flexDirection: 'row'}}>
                    <T style={timeTextStyle}>{this.distanceString}</T>
                </View>
             </View>
        )
    }
}
