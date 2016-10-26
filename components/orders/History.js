import { React, Component, View, TouchableOpacity, PureComponent, T } from '~/components/Component.js'
import { observable, computed, transaction, action } from 'mobx'
import { observer } from 'mobx-react/native'

import Icon from 'react-native-vector-icons/FontAwesome'

import { TextHeader } from '../Header.js'
import { SimpleListView, Descriptor } from '../SimpleListView.js'
import { SmallOkCancelModal, SimpleModal } from '../Modals.js'
import { barStore, loginStore, orderStore } from '~/model/store.js'
import { BarCard, BarName, timeTextStyle } from '../bar/BarCard.js'
import { Receipt } from './Receipt.js'
import { config } from '~/utils/config.js'
import { Second } from '~/utils/time.js'
import { DownloadComponent } from '../download/DownloadComponent'
import * as _ from '~/utils/curry.js'

/***************************************************************************/

import type { CacheInfo } from '~/network/cache.js'

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

    @computed get numberOfRows() {
        return this.orderHistory.length
    }

    refresh = async () => {
        await this.runRefresh(async () => {
            await this.orderHistoryDownload.forceRefresh()
        })
    }

    renderRow = (i) => {
        const orderResult = this.orderHistory[i]
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
export class OrderHistory extends DownloadComponent {
    errorMessage = "Error downloading order history..."
    getDownload = () => {
        return new HistoryQueryDownload()
    }
    renderFinished = (_) => {
        const descriptor = new OrderHistoryDescriptor(
            this.download,
            this.download.orderHistory,
        )
        return <SimpleListView descriptor={descriptor} />
    }
}

@observer
class HistoryBarCard extends DownloadComponent {
    /* properties:
        rowNumber: Int
        orderResult: OrderResult
    */
    receiptModal = null
    errorMessage = "Error downloading bar info"

    getDownload = () => {
        return new BarInfoDownload(this.barID)
    }

    get orderResult() {
        return this.props.orderResult
    }

    get barID() {
        return this.orderResult.barID
    }

    get bar() {
        return this.download.lastValue
    }

    showReceiptModal = () => {
        this.receiptModal.show()
    }

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
