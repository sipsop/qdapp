from curry import typeddict, alias

from .common import Price
from .menu import DrinkID

UserID = alias('UserID', str)
OrderID = alias('OrderID', str)

OrderItem = typeddict(
    [ ('drinkID',       DrinkID)
    # 'pint', 'half-pint', 'glass', 'bottle', etc
    , ('drinkSize',     str)
    # e.g. ["shandy"]
    , ('drinkOpts',     [str])
    # number of drinks ordered
    , ('drinkCount',    int)
    ], name='OrderItem')

Order = typeddict(
    [ ('user',          UserID)
    , ('items',         [OrderItem])
    # Reject order when the server and client disagree on the price
    , ('total',         Price)
    ], name='Order')
