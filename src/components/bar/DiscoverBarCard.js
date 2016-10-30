import {
    React,
    StyleSheet,
    View,
    PureComponent
} from '~/src/components/Component.js'
import { action } from 'mobx'
import { observer } from 'mobx-react/native'
import { tabStore, orderStore } from '~/src/model/store.js'
import { barStore } from '~/src/model/barstore.js'

import { ConfirmChangeBarModal } from './ConfirmChangeBarModal'
import { BarCard } from './BarCard'

const styles = StyleSheet.create({
    view: {
        flex: 0,
        marginTop: 5,
        marginLeft: 5,
        marginRight: 5,
    },
    border: {
        borderColor: '#000',
        borderWidth: 0.5,
    },
})

@observer
export class DiscoverBarCard extends PureComponent {
    /* properties:
        borderRadius: Int
        imageHeight: Int
        bar: Bar
            bar info
        onBack: ?() => void
        showBackButton: Bool
        showBorder: Bool
            show a border around the bar card
    */
    modal = null

    static defaultProps = {
        borderRadius: 5,
        showBorder: false,
    }

    handleCardPress = () => {
        if (orderStore.orderList.length > 0 && this.props.bar.id !== barStore.barID) {
            this.modal.show()
        } else {
            this.setBar()
        }
    }

    @action setBar = () => {
        barStore.setBarID(this.props.bar.id, track = true)
        tabStore.setCurrentTab(1)
        if (barStore.barScrollView) {
            barStore.barScrollView.scrollTo({x: 0, y: 0})
        }
    }

    render = () => {
        const photos = this.props.bar.photos

        const viewStyle = {
            height: this.props.imageHeight,
            // borderRadius: this.props.borderRadius,
        }

        const borderStyle = this.props.showBorder && styles.border

        return (
            <View style={[styles.view, viewStyle, borderStyle]}>
                <ConfirmChangeBarModal
                    ref={ref => this.modal = ref}
                    onConfirm={this.setBar}
                    />
                <BarCard
                    {...this.props}
                    photo={photos && photos.length && photos[0]}
                    onPress={this.handleCardPress}
                    showDistance
                    />
            </View>
        )
    }
}
