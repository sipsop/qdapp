import datetime
import rethinkdb as r
from curry.typing import validate, alias, typeddict, URL, maybe_none, optional, enum

#===------------------------------------------------------------------===
# Tables
#===------------------------------------------------------------------===

conn = r.connect()
MenuItemDefs = r.db('qdodger').table('MenuItemDefs')

Orders      = r.db('qdodger').table('Orders')
MenuItems   = r.db('qdodger').table('MenuItems')

#===------------------------------------------------------------------===
# Types
#===------------------------------------------------------------------===

ID              = alias('ID', str)
PlaceID         = ID        # google maps PlaceID
BarID           = PlaceID   # uniquely identifies a bar, same as place id
MenuItemDefID   = alias('MenuItemDefID', ID)
MenuItemID      = alias('MenuItemID', ID)
OrderID         = ID

TagName = alias('TagName', str)

OptionType = enum('OptionType', [
    'Single',
    'AtMostOne',
    'ZeroOrMore',
    'OneOrMore',
])

Currency = enum('Currency', [
    'Sterling',
    'Euros',
    'Dollars',
])

PriceOption = enum('PriceOption', [
    'Absolute',
    'Relative',
])

Price = typeddict(
    [ ('currency', Currency)
    , ('option', PriceOption)
    , ('price', int) # in cents/pence
    ], name='Price')

MenuItemOption = typeddict(
    [ ('name',          str)
    , ('optionType',    OptionType)
    , ('optionList',    [str])
    , ('prices',        [Price])
    , ('defaultOption', int)
    ], name='MenuItemOption')

MenuItemDef = typeddict(
    [ ('id',    str)
    , ('name',  str)
    , ('desc',  str)
    , ('images', [URL])
    # Alcohol percentage
    , ('abv',   optional(str))
    # Year (e.g. for wines)
    , ('year',  optional(int))
    , ('tags',  [TagName])
    , ('options', optional([MenuItemOption]))
    ], name='MenuItemDef')

MenuItem = typeddict(
    [ ('id',      MenuItemID)
    , ('itemDef', MenuItemDefID)
    , ('barID',   BarID)
    , ('options', [MenuItemOption])
    # Field overrides
    # TODO: tags, images, abv, year, etc
    ], name='MenuItem'
)

#-----------------------------------------------------------------------#

OrderItem = typeddict(
    [ ('id',                ID)
    , ('menuItemID',        MenuItemID)
    , ('selectedOptions',   [[str]])
    , ('amount',            int)
    ], name='OrderItem')

Order = typeddict(
    [ ('id',                optional(OrderID))
    , ('barID',             BarID)
    , ('utcstamp',          datetime.datetime)
    , ('userID',            str)
    , ('userName',          str)
    , ('totalAmount',       int) # total number of drinks
    , ('totalPrice',        int) # total price
    , ('currency',          Currency)
    , ('orderList',         [OrderItem])
    , ('receipt',           maybe_none(str))

    , ('completed',         bool)
    , ('errorMessage',      maybe_none(str))
    ], name='HistoryItem')

#===------------------------------------------------------------------===
# Actions
#===------------------------------------------------------------------===

def run(query):
    return query.run(conn)

def get_item_defs() -> [MenuItemDef]:
    return list(run(MenuItemDefs))

def get_active_menu_items(barID):
    return get_item_defs()
    # TODO:
    # return run(MenuItems.filter({'barID': barID, 'isActive': True}))

def submit_order(order : Order):
    validate(order, Order)
    order = dict(order, utcstamp=r.epoch_time(order['utcstamp'].timestamp()))
    run(Orders.insert(order))

def get_order_history(userID, n=10) -> [Order]:
    return run(
        Orders.filter({'userID': userID})
              .order_by(r.desc('utcstamp'))
              .limit(n)
    )

def get_drinks_queue_size(barID) -> int:
    return run(
        Orders.filter({'completed': False})['totalAmount'].sum()
    )

def get_bar_queue_size(barID) -> int:
    return run(
        Orders.filter({'completed': False}).count()
    )
