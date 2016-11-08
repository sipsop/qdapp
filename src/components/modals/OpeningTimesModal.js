import React from 'react'
import {
  View,
  Text
} from 'react-native'
import {
    PureComponent,
    T
} from '/components/Component'
import { observer } from 'mobx-react/native'
import { computed } from 'mobx'
import Modal from 'react-native-modalbox'

import { barStore, timeStore } from '/model/store'
import { Time } from '/components/Time'
import { PINK_COLOR } from '/utils/appstyles/appColors'

const dayNames = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
]

const styles = {
    modalContainer: {
        width: 275,
        height: 425,
    },
    header: {
        textAlign: 'center',
        fontSize: 18,
        padding: 18,
        fontWeight: 'bold',
        color: PINK_COLOR
    },
    day: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 5
    },
    dayTextStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    timeText: {
        fontWeight: 'bold'
    },
    openingTime: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 13,
        height: 50,
    },
    row: {
        flexDirection: 'row',
    },
    seperator: {
        backgroundColor: '#f2f2f2',
        height: 1,
        marginRight: 15,
        marginLeft: 15
    }
}

@observer
export class OpeningTimesModal extends PureComponent {

    @computed get openingTimes () {
        const bar = barStore.getBar()
        return bar && bar.openingTimes || []
    }

    @computed get haveOpeningTimes () {
        return this.openingTimes.length > 0
    }

    renderTime = (openingTime) => {
        if (!openingTime) {
            return <T>Unknown</T>
        }
        return (
            <View style={styles.row}>
                <Time style={styles.timeText} time={openingTime.open} />
                <T style={styles.openingTime}> - </T>
                <Time style={styles.timeText} time={openingTime.close} />
            </View>
        )
    }

    renderOpeningTime = (openingTime, i) => {
        const today = i === timeStore.today
        const specialRow = today ? { backgroundColor: '#f6e6f5' } : { backgroundColor: '#fff' }
        return (
          <View key={i}>
            <View style={[styles.rowContainer, specialRow]}>
                <Text style={styles.dayTextStyle}>
                    {dayNames[i]}
                </Text>
                {this.renderTime(openingTime)}
          </View>
          <View style={styles.seperator}/>
        </View>
        )
    }

    render = () => {
        return (
          <Modal style={styles.modalContainer} onClosed={this.props.onClosedProp} isOpen={this.props.isVisible}>
            <Text style={styles.header}>Opening Times</Text>
            {this.openingTimes.map(this.renderOpeningTime)}
          </Modal>
        )
    }
}

// @observer
// class OpeningTimesModal extends PureComponent {
//     /* properties:
//         openingTimes: Array<OpeningTime>
//     */
//
//     modal = null
//     show = () => this.modal.show()
//     close = () => this.modal.close()
//
//     styles = {
//         view: {
//             flex: 1,
//         },
//         openingTimeView: {
//             height:             55,
//             flexDirection:      'row',
//             // justifyContent: 'flex-start',
//             alignItems:         'center',
//             borderBottomWidth:  1,
//             borderColor:        config.theme.primary.medium,
//         },
//         day: {
//             flex: 1,
//             justifyContent: 'center',
//             paddingLeft: 5,
//         },
//         dayTextStyle: {
//             fontSize: 25,
//             fontWeight: 'bold',
//             color: '#000',
//             fontFamily: undefined, // TODO: Install bold font
//             // textDecorationLine: 'underline',
//         },
//         openingTime: {
//             flex: 1,
//             justifyContent: 'center',
//             alignItems: 'center',
//         },
//         openingTimeTextStyle: {
//             fontSize: 25,
//             color: '#000',
//             fontFamily: undefined, // TODO: Install bold font
//         },
//     }
//
//     @computed get openingTimes() {
//         const bar = barStore.getBar()
//         return bar && bar.openingTimes || []
//     }
//
//     @computed get haveOpeningTimes() {
//         return this.openingTimes.length > 0
//     }
//
//     render = () => {
//         return <SimpleModal ref={ref => this.modal = ref}>
//             <View style={this.styles.view}>
//                 <TextHeader
//                     label="Opening Times"
//                     rowHeight={55}
//                     />
//                 {
//                     this.openingTimes.map(this.renderOpeningTime)
//                 }
//             </View>
//         </SimpleModal>
//     }
//
//     renderOpeningTime = (openingTime, i) => {
//         const today = i === timeStore.today
//         const openingTimeView = {
//             ...this.styles.openingTimeView,
//             backgroundColor: today ? config.theme.todayBackgroundColor : '#fff'
//         }
//         const openingTimeTextStyle = {
//             ...this.styles.openingTimeTextStyle,
//             fontWeight: today ? 'bold' : 'normal'
//         }
//         return <View key={i} style={openingTimeView}>
//             <View style={this.styles.day}>
//                 <T style={this.styles.dayTextStyle}>
//                     {dayNames[i]}
//                 </T>
//             </View>
//             <View style={this.styles.openingTime}>
//                 <OpeningTimeView
//                     openingTime={openingTime}
//                     textStyle={openingTimeTextStyle}
//                     />
//             </View>
//         </View>
//     }
// }
