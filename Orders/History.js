import { React, Component, View, TouchableOpacity, PureComponent, T } from '../Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'

import { TextHeader } from '../Header.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { DownloadResult, DownloadResultView, emptyResult, downloadManager, graphQLArg } from '../HTTP.js'
import { barStore, loginStore, orderStore } from '../Store.js'
import { BarCard, BarName, timeTextStyle } from '../Bar/BarCard.js'
import { Receipt } from './Receipt.js'
import { config } from '../Config.js'
import { Second } from '../Time.js'
import { OrderResultQuery } from './OrderQuery.js'
import * as _ from '../Curry.js'

/***************************************************************************/

import type { CacheInfo } from '../Cache.js'

/***************************************************************************/

const { log, assert } = _.utils('./Orders/History.js')

const getHistoryQuery = () => {
    assert(loginStore.userID != null, 'loginStore.userID != null')
    assert(loginStore.getAuthToken() != null, 'loginStore.getAuthToken() != null')

    return {
        OrderHistory: {
            args: {
                authToken: loginStore.getAuthToken(),
                n: 100,
            },
            result: {
                orderHistory: [OrderResultQuery],
            },
        }
    }
}

// const getHistoryQuery = () => {
//     assert(loginStore.userID != null, 'loginStore.userID != null')
//     return `
//         fragment PriceFragment on Price {
//             currency
//             option
//             price
//         }
//
//         query history {
//             recentOrders(token: ${graphQLArg(loginStore.getAuthToken())}, n: 100) {
//                 orderHistory {
//                     barID
//                     date {
//                         year
//                         month
//                         day
//                     }
//                     time {
//                         hour
//                         minute
//                         second
//                     }
//                     userName
//                     queueSize
//                     estimatedTime
//                     receipt
//                     menuItems {
//                         id
//                         name
//                         desc
//                         images
//                         tags
//                         price {
//                             ...PriceFragment
//                         }
//                         options {
//                             name
//                             optionType
//                             optionList
//                             prices {
//                                 ...PriceFragment
//                             }
//                             defaultOption
//                         }
//                     }
//                     orderList {
//                         id
//                         menuItemID
//                         selectedOptions
//                         amount
//                     }
//                     totalAmount
//                     totalPrice
//                     tip
//                     currency
//
//                     delivery
//                     tableNumber
//                     pickupLocation
//                 }
//             }
//         }
//     `
// }

const cacheInfo : CacheInfo = {...config.defaultCacheInfo, refreshAfter: 1 * Second}

const cardMargin = 10

const cardStyle = {
    marginLeft:     cardMargin,
    marginRight:    cardMargin,
    marginBottom:   cardMargin,
    height:         200,
}

@observer
export class OrderHistoryModal extends PureComponent {
    /* properties:
        onClose: () => void
    */
    modal = null

    show = () => this.modal.show()

    render = () => {
        return <SimpleModal
                    ref={ref => this.modal =ref}
                    onClose={this.props.onClose}
                    >
            <OrderHistory />
        </SimpleModal>
    }
}

class OrderHistoryDescriptor extends Descriptor {

    @computed get numberOfRows() {
        return orderHistoryStore.orderHistory.length
    }

    refresh = async () => {
        await this.runRefresh(async () => {
            await orderHistoryStore.fetchOrderHistory()
        })
    }

    renderRow = (i) => {
        const orderResult = orderHistoryStore.orderHistory[i]
        return <HistoryBarCard
                    rowNumber={i}
                    orderResult={orderResult} />
    }

    renderHeader = () => {
        return <View style={{flex: 0, height: 55, marginBottom: cardMargin}}>
            <TextHeader
                label="Order History"
                rowHeight={55}
                />
        </View>
    }
}

@observer
export class OrderHistory extends DownloadResultView {
    errorMessage = "Error downloading order history..."
    getDownloadResult = () => orderHistoryStore.getOrderHistoryDownload()
    refreshPage = () => orderHistoryStore.fetchOrderHistory()
    renderNotStarted = () => <View />

    renderFinished = (_) => {
        return <SimpleListView descriptor={new OrderHistoryDescriptor()} />
    }
}

@observer
class HistoryBarCard extends DownloadResultView {
    /* properties:
        rowNumber: Int
        orderResult: OrderResult
    */
    @observable barDownload = emptyResult()
    receiptModal = null

    errorMessage = "Error downloading bar info"
    refreshPage  = () => this.downloadBarInfo()
    getDownloadResult = () => this.barDownload
    renderNotStarted = () => <View />

    get orderResult() {
        return this.props.orderResult
    }

    get barID() {
        return this.orderResult.barID
    }

    get bar() {
        return this.barDownload.value
    }

    showReceiptModal = () => {
        this.receiptModal.show()
    }

    componentDidMount = _.logErrors(async () => {
        this.barDownload.downloadStarted()
        this.barDownload = await barStore._getBarInfo(this.barID)
    })

    renderFinished = (bar) => {
        log("rendering bar card number", this.props.rowNumber)
        return this.renderBarCard(bar)
    }

    renderBarCard = (bar) => {
        return <View style={cardStyle}>
            <SimpleReceiptModal
                ref={ref => this.receiptModal = ref}
                bar={bar}
                orderResult={this.props.orderResult}
                />
            <BarCard
                bar={bar}
                photo={bar.photos && bar.photos[0]}
                imageHeight={200}
                footer={this.renderFooter(bar.name)}
                onPress={this.showReceiptModal}
                />
        </View>
    }

    renderFooter = (barName, textColor = '#fff') => {
        return <HistoryBarCardFooter
                    barName={barName}
                    orderResult={this.orderResult}
                    textColor={textColor} />
    }
}

@observer
class SimpleReceiptModal extends PureComponent {
    /* properties:
        onClose: () => void
        bar: Bar
        orderResult: OrderResult
    */

    modal = null
    show = () => this.modal.show()
    close = () => this.modal.close()

    render = () => {
        return <SimpleModal
                    ref={ref => this.modal = ref}
                    onClose={this.props.onClose}
                    >
            <Receipt
                bar={this.props.bar}
                orderResult={this.props.orderResult}
                showEstimate={false}
                showBackButton={true}
                onClose={this.close}
                alwaysShowTotal={true}
                />
        </SimpleModal>
    }
}

@observer
class HistoryBarCardFooter extends PureComponent {
    /* properties:
        barName: String
        orderResult: OrderResult
        textColor: String
    */

    render = () => {
        const orderResult = this.props.orderResult
        // const total = orderStore.orderListTotal(orderResult.orderList)
        const total = orderResult.totalPrice + orderResult.tip
        const totalText = orderStore.formatPrice(total, orderResult.currency)
        return <View style={
                { marginLeft: 5
                , marginRight: 5
                }
            }>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Icon name="clock-o" size={15} color={this.props.textColor} />
                    {/*
                    <DateView
                        date={orderResult.date}
                        textStyle={{...timeTextStyle, marginLeft: 5}}
                        />
                    <TimeView
                        time={orderResult.time}
                        textStyle={{...timeTextStyle, marginLeft: 5}}
                        />
                    */}
                </View>
                <T style={{color: this.props.textColor, textAlign: 'right'}}>#{orderResult.receipt}</T>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                    <BarName barName={this.props.barName} />
                </View>
                <T style={{color: this.props.textColor, textAlign: 'right', fontSize: 20}}>{totalText}</T>
            </View>
        </View>
    }
}

@observer
class DateView extends PureComponent {
    /* properties:
        date: Date
        textStyle: text style object
    */

    render = () => {
        const date = this.props.date
        return <T style={this.props.textStyle}>
            {date.year}/{formatNumber(date.month)}/{formatNumber(date.day)}
        </T>
    }
}

@observer
class TimeView extends PureComponent {
    /* properties:
        time: Time
        textStyle: text style object
    */

    render = () => {
        const time = this.props.time
        return <T style={this.props.textStyle}>
            {formatNumber(time.hour)}:{formatNumber(time.minute)}
        </T>
    }
}

const formatNumber = (i) => {
    if (i < 10)
        return '0' + i
    return '' + i
}


class OrderHistoryStore {
    @observable orderHistoryDownload = emptyResult()

    getOrderHistoryDownload = () => this.orderHistoryDownload

    fetchOrderHistory = _.logErrors(async () => {
        await this._fetchOrderHistory()
    })

    _fetchOrderHistory = async () => {
        this.orderHistoryDownload.downloadStarted()
        log('query...', getHistoryQuery())
        const download = await downloadManager.query(
            'qd:order:history', getHistoryQuery(), cacheInfo, timeoutDesc = 'short')
        // const download = await downloadManager.graphQL(
        //     'qd:order:history', getHistoryQuery(), cacheInfo, timeoutDesc = 'short')
        log("GOT RESULT", download.state, download.value)
        _.runAndLogErrors(() => {
            this.orderHistoryDownload = download.update(data => data.orderHistory)
        })
    }

    @computed get orderHistory() : Array<OrderResult> {
        if (!this.orderHistoryDownload.value)
            return []
        return this.orderHistoryDownload.value
    }
}

export const orderHistoryStore = new OrderHistoryStore()
