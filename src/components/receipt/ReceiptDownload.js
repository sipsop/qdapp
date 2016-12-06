import { React, Component, View, T, PureComponent } from '/components/Component'
import { observer } from 'mobx-react/native'
import { OrderStatusView } from './OrderStatusView'
import { Receipt } from './Receipt'

@observer
export class ReceiptDownload extends OrderStatusView {
    /* properties:
        bar: Bar
        orderID: OrderID
        onClose: () => void
            called when receipt view is closed
    */
    renderFinished = (_) => {
        if (!this.orderResult) {
            /* TODO: Why is orderResult null sometimes? */
            return this.renderInProgress()
        }
        return (
            <Receipt
                bar={this.props.bar}
                orderResult={this.orderResult}
                onClose={this.props.onClose}
                />
        )
    }
}
