import { MenuItemQuery } from '../Bar/MenuQuery.js'

export const OrderItemQuery = {
    id:                 'String',
    menuItemID:         'String',
    selectedOptions:    [['String']],
    amount:             'Int',
}

export const OrderResultQuery = {
    errorMessage: 'String',
    barID:        'String',
    timestamp:    'Float',
    userName:     'String',

    queueSize:     'Int',
    estimatedTime: 'Int',
    receipt:       'String',

    menuItems:      [MenuItemQuery],
    orderList:      [OrderItemQuery],
    totalAmount:    'Int',
    totalPrice:     'Int',
    tip:            'Int',
    currency:       'String',

    delivery:       'String',
    tableNumber:    'String',
    pickupLocation: 'String',
}
