import { React, Component, View, PureComponent, T, Icon } from '~/components/Component'
import { observer } from 'mobx-react/native'

import { getBarOpenTime } from '~/model/barstore.js'
import { OpeningTimeView } from './OpeningTimeView'

const timeTextStyle = {fontSize: 11, color: '#fff'}

@observer
export class TimeInfo extends PureComponent {
    /* properties:
        bar: schema.Bar
    */
    render = () => {
        const openingTime = getBarOpenTime(this.props.bar)
        return (
            <View style={{flexDirection: 'row', alignItems: 'flex-end', marginRight: 10}}>
                <Icon name="clock-o" size={15} color='#fff' />
                <View style={{marginLeft: 5, flexDirection: 'row'}}>
                    {
                        openingTime
                            ? this.renderOpeningTime(openingTime)
                            : this.renderUnknownOpeningTime()
                    }
                </View>
            </View>
        )
    }

    renderOpeningTime = (openingTime) => {
        return <OpeningTimeView
                    openingTime={openingTime}
                    textStyle={timeTextStyle} />
    }

    renderUnknownOpeningTime = () => {
        let text
        if (this.props.bar.openNow != null) {
            if (this.props.bar.openNow) {
                text = 'open'
            } else {
                text = 'closed'
            }
        } else {
            text = 'unknown'
        }
        return <T style={timeTextStyle}>{text}</T>
    }
}
