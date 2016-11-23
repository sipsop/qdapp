import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import { TextHeader } from '../Header.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { loginStore } from '/model/store.js'
import { ConnectionBar } from '/components/notification/ConnectionBar'
import { BarCardDownload, cardMargin } from './BarCardDownload'
import { DiscoverBarCard } from './DiscoverBarCard'
import * as _ from '/utils/curry.js'

const { log, assert } = _.utils('/components/bar/OwnedBarList.js')

/* Modal showing a list of bars that the user is a bar admin for */
@observer
export class OwnedBarList extends PureComponent {
    /* properties:
        onClose: () => void
    */

    modal = null
    show = () => this.modal.show()
    close = () => this.modal.close()

    @computed get descriptor() {
        return new OwnedBarListDescriptor(() => {
            /* Close OwnedBarList modal whenever the user selects a bar */
            this.modal.close()
            this.props.onClose()
        })
    }

    render = () => {
        return <SimpleModal
                    ref={ref => this.modal = ref}
                    onClose={this.props.onClose}
                    >
            <SimpleListView descriptor={this.descriptor} />
        </SimpleModal>
    }
}

class OwnedBarListDescriptor extends Descriptor {
    constructor(onPress) {
        super()
        this.onPress = onPress
    }

    @computed get rows() : Array<BarID> {
        return loginStore.ownedBars
    }

    refresh = loginStore.refreshUserProfile

    renderRow = (barID, i) => {
        return (
            <OwnedBarCard
                rowNumber={i}
                barID={barID}
                onPress={this.onPress}
                />
        )
    }

    renderHeader = () => {
        return <View style={{flex: 0, marginBottom: cardMargin}}>
            <ConnectionBar />
            <TextHeader
                label="Bar Admin"
                rowHeight={55}
                />
        </View>
    }
}

/* Component that downloads bar info and shows a DiscoverBarCard */
@observer
class OwnedBarCard extends BarCardDownload {
    /* properties:
        barID: BarID
        onPress: ?() => void
    */
    renderFinished = (bar) => {
        return (
            <DiscoverBarCard
                bar={bar}
                onPress={this.props.onPress}
                />
        )
    }
}
