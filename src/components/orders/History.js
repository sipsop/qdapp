import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'

import { TextHeader } from '../Header.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { barStore, loginStore, orderStore } from '/model/store.js'
import { BarCard, BarName, timeTextStyle } from '../bar/BarCard.js'
import { ReceiptDownload } from './Receipt.js'
import { DownloadComponent } from '../download/DownloadComponent'
import { ConnectionBar } from '/components/notification/ConnectionBar'

import { HistoryQueryDownload } from '/network/api/orders/history'
import { BarInfoDownload } from '/network/api/maps/place-info.js'

import { config } from '/utils/config.js'
import { Second } from '/utils/time.js'
import * as _ from '/utils/curry.js'

/***************************************************************************/

import type { CacheInfo } from '/network/cache.js'

/***************************************************************************/

const { log, assert } = _.utils('./orders/History.js')

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
    constructor(orderHistoryDownload, orderHistory) {
        super()
        this.orderHistoryDownload = orderHistoryDownload
        this.orderHistory = orderHistory
    }

    @computed get rows() : Array<HistoryItem> {
        return this.orderHistory
    }

    // rowHasChanged = (orderResult1, orderResult2) => {
    //     return orderResult1.orderID !== orderResult2.orderID
    // }

    refresh = async () => {
        await this.runRefresh(async () => {
            await this.orderHistoryDownload.forceRefresh()
        })
    }

    renderRow = ({orderID, barID}, i) => {
        assert(barID != null, "barID is null...")
        assert(orderID != null, "orderID is null...")
        return (
            <HistoryBarCard
                rowNumber={i}
                barID={barID}
                orderID={orderID}
                />
        )
    }

    renderHeader = () => {
        return <View style={{flex: 0, marginBottom: cardMargin}}>
            <ConnectionBar />
            <TextHeader
                label="Order History"
                rowHeight={55}
                />
        </View>
    }
}

@observer
export class OrderHistory extends DownloadComponent {
    errorMessage = "Error downloading order history..."

    getDownload = () => {
        return new HistoryQueryDownload(() => {
            return {
                isLoggedIn: loginStore.isLoggedIn,
                authToken:  loginStore.getAuthToken(),
                userID:     loginStore.userID,
            }
        })
    }

    @computed get orderHistory() : Array<HistoryItem> {
        return this.getDownloadResult().orderHistory
    }

    renderFinished = (_) => {
        const descriptor = new OrderHistoryDescriptor(
            this.getDownloadResult(),
            this.orderHistory,
        )
        return <SimpleListView descriptor={descriptor} />
    }
}

@observer
class HistoryBarCard extends DownloadComponent {
    /* properties:
        rowNumber: Int
        orderID: OrderID
        barID: BarID
    */
    receiptModal = null

    getDownload = () => {
        return new BarInfoDownload(() => {
            return {
                barID: this.props.barID,
            }
        })
    }

    showReceiptModal = () => {
        this.receiptModal.show()
    }

    renderFinished = (bar) => {
        return this.renderBarCard(bar)
    }

    renderBarCard = (bar) => {
        assert(this.props.orderID != null, "orderID is null...")
        return <View style={cardStyle}>
            <SimpleReceiptModal
                ref={ref => this.receiptModal = ref}
                bar={bar}
                orderID={this.props.orderID}
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
        orderID: OrderID
    */

    modal = null
    show = () => this.modal.show()
    close = () => this.modal.close()

    render = () => {
        assert(this.props.orderID != null, "orderID is null...")
        return <SimpleModal
                    ref={ref => this.modal = ref}
                    onClose={this.props.onClose}
                    >
            <ConnectionBar />
            <ReceiptDownload
                bar={this.props.bar}
                orderID={this.props.orderID}
                onClose={this.close}
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
