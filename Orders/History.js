import { React, Component, View, TouchableOpacity, PureComponent, T } from '../Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'

import { TextHeader } from '../Header.js'
import { SimpleListView } from '../SimpleListView.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { DownloadResult, DownloadResultView, emptyResult, downloadManager, graphQLArg } from '../HTTP.js'
import { barStore, loginStore, orderStore } from '../Store.js'
import { BarCard, BarName, timeTextStyle } from '../Bar/BarCard.js'
import { config } from '../Config.js'
import { Second } from '../Time.js'
import * as _ from '../Curry.js'

/***************************************************************************/

import type { CacheInfo } from '../Cache.js'

/***************************************************************************/

const { log, assert } = _.utils('./Orders/History.js')

const getHistoryQuery = () => {
    assert(loginStore.userID != null, 'loginStore.userID != null')
    return `
        fragment PriceFragment on Price {
            currency
            option
            price
        }

        query history {
            recentOrders(userID: ${graphQLArg(loginStore.userID)}, n: 100) {
                orderHistory {
                    barID
                    date {
                        year
                        month
                        day
                    }
                    time {
                        hour
                        minute
                        second
                    }
                    userName
                    queueSize
                    estimatedTime
                    receipt
                    menuItems {
                        id
                        name
                        desc
                        images
                        tags
                        price {
                            ...PriceFragment
                        }
                        options {
                            name
                            optionType
                            optionList
                            prices {
                                ...PriceFragment
                            }
                            defaultOption
                        }
                    }
                    orderList {
                        id
                        menuItemID
                        selectedOptions
                        amount
                    }
                    totalAmount
                    totalPrice
                    currency
                }
            }
        }
    `
}

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

@observer
export class OrderHistory extends DownloadResultView {
    errorMessage = "Error downloading order history..."
    getDownloadResult = () => orderHistoryStore.getOrderHistoryDownload()
    refreshPage = () => orderHistoryStore.fetchOrderHistory()
    renderNotStarted = () => <View />

    @computed get nItems() {
        return orderHistoryStore.orderHistory.length
    }

    renderFinished = (_) => {
        return <SimpleListView
                    N={this.nItems}
                    initialListSize={4}
                    renderRow={this.renderRow}
                    renderHeader={this.renderHeader}
                    enableEmptySections={true} />
    }

    renderHeader = () => {
        return <View style={{flex: 0, height: 55, marginBottom: cardMargin}}>
            <TextHeader
                    label="Order History"
                    rowHeight={55} />
        </View>
    }

    renderRow = (i) => {
        const orderResult = orderHistoryStore.orderHistory[i]
        return <HistoryBarCard orderResult={orderResult} />
    }
}

@observer
class HistoryBarCard extends DownloadResultView {
    /* properties:
        orderResult: OrderResult
    */
    @observable barDownload = emptyResult()

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
        // TODO:
    }

    componentDidMount = _.logErrors(async () => {
        this.barDownload.downloadStarted()
        this.barDownload = await barStore._getBarInfo(this.barID)
    })

    renderInProcess = () => {
        return <View style={cardStyle}>
            {DownloadResultView.renderProcess(this)}
        </View>
    }

    renderFinished = (bar) => {
        return <View style={cardStyle}>
            <BarCard
                bar={bar}
                imageHeight={200}
                footer={this.renderFooter(bar)}
                onPress={this.showReceiptModal}
                />
        </View>
    }

    renderFooter = (bar) => {
        return <HistoryBarCardFooter
                    bar={bar}
                    orderResult={this.orderResult}
                    />
    }
}

@observer
class HistoryBarCardFooter extends PureComponent {
    /* properties:
        bar: Bar
        orderResult: OrderResult
    */

    render = () => {
        const orderResult = this.props.orderResult
        // const total = orderStore.orderListTotal(orderResult.orderList)
        const total = orderResult.totalPrice
        const totalText = orderStore.formatPrice(total, orderResult.currency)
        return <View style={
                { marginLeft: 5
                , marginRight: 5
                }
            }>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Icon name="clock-o" size={15} color='#fff' />
                    <DateView
                        date={orderResult.date}
                        textStyle={{...timeTextStyle, marginLeft: 5}}
                        />
                    <TimeView
                        time={orderResult.time}
                        textStyle={{...timeTextStyle, marginLeft: 5}}
                        />
                </View>
                <T style={{color: '#fff', textAlign: 'right'}}>#{orderResult.receipt}</T>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                    <BarName barName={this.props.bar.name} />
                </View>
                <T style={{color: '#fff', textAlign: 'right', fontSize: 20}}>{totalText}</T>
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
        const download = await downloadManager.graphQL(
            'qd:order:history', getHistoryQuery(), cacheInfo)
        _.runAndLogErrors(() => {
            this.orderHistoryDownload = download.update(data => data.recentOrders)
        })
    }

    @computed get orderHistory() : Array<OrderResult> {
        if (!this.orderHistoryDownload.value)
            return []

        return this.orderHistoryDownload.value.orderHistory
    }
}

export const orderHistoryStore = new OrderHistoryStore()
