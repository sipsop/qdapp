from curry import typeddict, URL, alias, enum

from .bar import BarID

DrinkID = alias('DrinkID', str)
URL     = alias('URL', str)
Price   = alias('Price', float)

Category = enum('Category',
    [ 'Beer'
    , 'Wine'
    , 'Spirits'
    , 'Cocktails'
    ])

MenuItem = typeddict(
    [ ('drinkID',           DrinkID)
    , ('name',              str)
    , ('image',             URL)
    , ('desc',              str)
    , ('tags',              [str])
    , ('drinkSizes',        [str])
    , ('drinkSizePrices',   [Price])
    , ('drinkOpts',         [[str]])
    , ('drinkOptsPrices',   [[Price]])
    ], name='MenuItem')

Menu = typeddict(
    [ ('barID',             BarID)
    , ('items',             {Category: MenuItem})
    ], name='Menu')
