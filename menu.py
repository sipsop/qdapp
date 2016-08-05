from curry import typeddict, URL, alias, enum
from curry.typing.javascript import to_javascript

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
    [ ('items', {Category: MenuItem})
    ], name='Menu')

to_javascript([Menu])
