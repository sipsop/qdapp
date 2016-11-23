import {
    React,
    StyleSheet,
    View,
    PureComponent
} from '/components/Component'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { BarCard } from './BarCard'
import { DownloadComponent } from '../download/DownloadComponent'
import { BarInfoDownload } from '/network/api/maps/place-info'

export const cardMargin = 5

const cardStyle = {
    marginLeft:     cardMargin,
    marginRight:    cardMargin,
    marginBottom:   cardMargin,
    height:         200,
}

@observer
export class BarCardDownload extends DownloadComponent {
    /* properties:
        barID: BarID
        onPress: (bar : Bar) => void
    */

    getDownload = () => {
        return new BarInfoDownload(
            () => {
                return {
                    barID: this.props.barID,
                }
            }
        )
    }

    renderBarCard = (bar) => {
        return (
            <View style={cardStyle}>
                <BarCard
                    bar={bar}
                    photo={bar.photos && bar.photos[0]}
                    imageHeight={200}
                    onPress={this.showReceiptModal}
                    />
            </View>
        )
    }

    renderFinished = (bar) => {
        throw new Error("renderFinished() of BarCardDownload not implemented")
    }
}
