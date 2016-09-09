# from collections import OrderedDict

# from graphql.execution.executor import Executor
# from graphql.execution.middlewares.gevent import GeventExecutionMiddleware, run_in_greenlet
from graphql.execution.executors.gevent import GeventExecutor #, run_in_greenlet

import time
import string
import random
import graphene

# ID  = graphene.ID().NonNull
ID  = graphene.String().NonNull
BarID = ID
MenuItemID = ID
URL = graphene.String().NonNull

outsideURL = "http://blog.laterooms.com/wp-content/uploads/2014/01/The-Eagle-Cambridge.jpg"
insideURL = "http://www.vintagewings.ca/Portals/0/Vintage_Stories/News%20Stories%20L/EaglePubRedux/Eagle14.jpg"

class Drink(graphene.ObjectType):
    id = ID
    name = graphene.String().NonNull
    desc = graphene.String()
    images = graphene.List(URL).NonNull
    tags = graphene.List(graphene.String().NonNull)

class Currency(graphene.Enum):
    Sterling = 0
    Euros    = 1
    Dollars  = 2

class PriceOption(graphene.Enum):
    Absolute = 0    # absolute price, e.g. 3.40
    Relative = 1    # relative price, e.g. +0.50 (for add-ons)

class Price(graphene.ObjectType):
    currency = graphene.NonNull(Currency)
    option = graphene.NonNull(PriceOption)
    price = graphene.Float().NonNull

    @classmethod
    def pounds(cls, price):
        return Price(
            currency=Currency.Sterling,
            option=PriceOption.Absolute,
            price=price)

    @classmethod
    def euros(cls, price):
        return Price(
            currency=Currency.Euros,
            option=PriceOption.Absolute,
            price=price)

    @classmethod
    def dollars(cls, price):
        return Price(
            currency=Currency.Dollars,
            option=PriceOption.Absolute,
            price=price)

class OptionType(graphene.Enum):
    Single     = 0
    AtMostOne  = 1
    ZeroOrMore = 2
    OneOrMore  = 3


class MenuItemOption(graphene.ObjectType):
    id = ID
    # menu option name (e.g. "Size")
    name    = graphene.String().NonNull

    # type of option list
    optionType = graphene.NonNull(OptionType)

    # List of options to choose from, e.g. ["pint", "half-pint"]
    optionList = graphene.List(graphene.String()).NonNull

    # List of prices for each option, e.g. [Price(3.40), Price(2.60)]
    prices  = graphene.List(Price).NonNull

    # Index of the default option. If there is no default, this is null
    # (only allowed when optionType == 'ZeroOrMore' or 'ZeroOrOne')
    defaultOption = graphene.Int()

class MenuItem(graphene.ObjectType):
    id      = ID
    name    = graphene.String().NonNull
    desc    = graphene.String()
    images  = graphene.List(URL)
    tags    = graphene.List(graphene.String())
    price   = graphene.NonNull(Price)
    options = graphene.List(MenuItemOption).NonNull


class SubMenu(graphene.ObjectType):
    image     = URL
    menuItems = graphene.List(MenuItem).NonNull

class Menu(graphene.ObjectType):
    placeID   = ID
    beer      = graphene.NonNull(SubMenu)
    wine      = graphene.NonNull(SubMenu)
    spirits   = graphene.NonNull(SubMenu)
    cocktails = graphene.NonNull(SubMenu)
    water     = graphene.NonNull(SubMenu)
    # snacks    = graphene.NonNull(SubMenu)
    # food      = graphene.NonNull(SubMenu)

class Day(graphene.Enum):
    Sunday    = 0
    Monday    = 1
    Tuesday   = 2
    Wednesday = 3
    Thursday  = 4
    Friday    = 5
    Saturday  = 6

class Time(graphene.ObjectType):
    hour    = graphene.Int()
    minute  = graphene.Int()
    second  = graphene.Int()

class OpeningTime(graphene.ObjectType):
    # day = graphene.NonNull(Day)
    openTime = graphene.Field(Time)
    closeTime = graphene.Field(Time)

class Address(graphene.ObjectType):
    lat = graphene.Float().NonNull
    lon = graphene.Float().NonNull
    city = graphene.String().NonNull
    street = graphene.String().NonNull
    number = graphene.String().NonNull
    postcode = graphene.String().NonNull

class BarType(graphene.Enum):
    Pub = 0
    Club = 1

# class Bar(graphene.ObjectType):
#     id     = ID
#     name   = graphene.String().NonNull
#     desc   = graphene.String()
#     barType = graphene.NonNull(BarType)
#     signedUp = graphene.Boolean().NonNull
#     images = graphene.List(URL).NonNull
#     tags   = graphene.List(graphene.String().NonNull)
#     phone  = graphene.String()
#     website = graphene.String()
#     openingTimes = graphene.List(OpeningTime).NonNull
#     address = graphene.NonNull(Address)
    # menu   = graphene.Field(Menu)

    # def resolve_menu(self, args, info):
    #     return menu

class TagInfo(graphene.ObjectType):
    tagID    = graphene.String().NonNull
    tagName  = graphene.String().NonNull
    excludes = graphene.List(ID).NonNull

class TagEdge(graphene.ObjectType):
    srcID = graphene.String().NonNull
    dstID = graphene.String().NonNull

class Tags(graphene.ObjectType):
    tagInfo  = graphene.List(TagInfo).NonNull
    tagGraph = graphene.List(TagEdge).NonNull

menuTags = Tags(
    tagInfo=[
        TagInfo('0', 'beer',       excludes=['1', '2', '3', '4']),
        TagInfo('1', 'wine',       excludes=['0', '2', '3', '4']),
        TagInfo('2', 'spirits',    excludes=['0', '1', '3', '4']),
        TagInfo('3', 'cocktails',  excludes=['0', '1', '2', '4']),
        TagInfo('4', 'water',      excludes=['0', '1', '2', '3']),
        TagInfo('20', 'stout',     excludes=['21', '22']),
        TagInfo('21', 'ale',       excludes=['20', '22']),
        TagInfo('22', 'lager',     excludes=['20', '21']),
        TagInfo('30', 'tap',       excludes=['31', '32']),
        TagInfo('31', 'bottle',    excludes=['30', '32']),
        TagInfo('32', 'can',       excludes=['30', '31']),
        TagInfo('40', 'hops',      excludes=[]),
        TagInfo('41', 'light',     excludes=['42']),
        TagInfo('42', 'dark',      excludes=['41']),
        TagInfo('43', 'fruity',    excludes=[]),
        TagInfo('44', 'chocolate', excludes=[]),
        TagInfo('45', 'bacon', excludes=[]),
    ],
    tagGraph=[
        TagEdge(srcID='0', dstID='20'),
        TagEdge(srcID='0', dstID='21'),
        TagEdge(srcID='0', dstID='22'),
        TagEdge(srcID='0', dstID='30'),
        TagEdge(srcID='0', dstID='31'),
        TagEdge(srcID='0', dstID='32'),
        TagEdge(srcID='20', dstID='40'),
        TagEdge(srcID='20', dstID='41'),
        TagEdge(srcID='20', dstID='42'),
        TagEdge(srcID='20', dstID='43'),
        TagEdge(srcID='20', dstID='44'),
        TagEdge(srcID='20', dstID='45'),
        TagEdge(srcID='21', dstID='40'),
        TagEdge(srcID='21', dstID='41'),
        TagEdge(srcID='21', dstID='42'),
        TagEdge(srcID='21', dstID='43'),
        TagEdge(srcID='21', dstID='44'),
        TagEdge(srcID='21', dstID='45'),
        TagEdge(srcID='22', dstID='40'),
        TagEdge(srcID='22', dstID='41'),
        TagEdge(srcID='22', dstID='42'),
        TagEdge(srcID='22', dstID='43'),
        TagEdge(srcID='22', dstID='44'),
        TagEdge(srcID='22', dstID='45'),
    ],
)

eagleID = 'ChIJuQdxBb1w2EcRvnxVeL5abUw'

class Query(graphene.ObjectType):

    # bar  = graphene.Field(Bar, id=ID)
    barListTags = graphene.Field(Tags)
    menuTags = graphene.Field(Tags)
    menu = graphene.Field(Menu, placeID=ID)

    def resolve_menu(self, args, info):
        placeID = args['placeID']
        return makeMenu(placeID)

    def resolve_menuTags(self, args, info):
        return menuTags


beer = "http://www.menshealth.com/sites/menshealth.com/files/styles/slideshow-desktop/public/images/slideshow2/beer-intro.jpg?itok=hhBQBwWj"
wine = "https://employee.foxandhound.com/Portals/0/images/slideshow/wine-pour-slide2.jpg"
spirits = "https://biotechinasia.files.wordpress.com/2015/10/two-whisky-glasses.jpg"
cocktails = "http://notable.ca/wp-content/uploads/2015/06/canada-day-cocktails.jpg"
water = "http://arogyam.zest.md/uploads/gallery/df4fe8a8bcd5c95cdb640aa9793bb32b/images/201212042159565.jpg"
snacks = "https://www.google.co.uk/search?q=peanuts&client=ubuntu&hs=sBq&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiT_47KnLnOAhXJuRoKHaNqD7QQ_AUICCgB&biw=1920&bih=919#tbm=isch&q=snacks&imgrc=sjXgiZ2yIgbsCM%3A"

guiness = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"
heineken = "https://upload.wikimedia.org/wikipedia/commons/a/ad/Heineken_lager_beer_made_in_China.jpg"
rockBottom = "http://3.bp.blogspot.com/_R8IDaEfZhDs/SwPlVIClDwI/AAAAAAAAA9M/UrPntmIjnA4/s1600/PB170236.JPG"

def option(price1, price2):
    return MenuItemOption(
        name="Size",
        optionType=OptionType.Single,
        optionList=[
            "pint",
            "half-pint",
        ],
        prices=[
            price1, price2
        ],
        defaultOption=0,
    )

zero = Price(
    currency=Currency.Sterling,
    option=PriceOption.Relative,
    price=0.0,
)

fiftyP = Price(
    currency=Currency.Sterling,
    option=PriceOption.Relative,
    price=0.5,
)

top_option = MenuItemOption(
    name="Top",
    optionType=OptionType.AtMostOne,
    optionList=[
        "tops (lemonade)",
        "shandy",
        "lime",
        "blackcurrant",
    ], #+ ["x%d" % i for i in range(100)],
    prices=[
        zero,
        zero,
        fiftyP,
        zero,
        zero,
    ], #+ [zero] * 100,
    defaultOption=None,
)

def makeMenu(placeID):
    return Menu(
        placeID=placeID,
        beer=SubMenu(
            image=beer,
            menuItems=[
                MenuItem(
                    id='1',
                    name="Guiness",
                    desc="Guiness is a dry irish stout from Dublin, Ireland.",
                    images=[guiness],
                    tags=['0', '20', '30', '42'],
                    price=Price.pounds(3.40),
                    options=[
                        option(Price.pounds(3.40), Price.pounds(2.60)),
                        top_option,
                    ],
                ),
                MenuItem(
                    id='2',
                    name="Heineken",
                    desc="Heineken is a pale lager",
                    images=[heineken],
                    tags=['0', '22', '31', '40', '41'],
                    price=Price.pounds(3.20),
                    options=[
                        option(Price.pounds(3.20), Price.pounds(2.30)),
                        top_option,
                    ],
                ),
                MenuItem(
                    id='3',
                    name="Rock Bottom Cask Conditioned Bourbon Chocolate Oatmeal Lager",
                    desc="This beer has a rather long name...",
                    images=[rockBottom],
                    tags=['0', '22', '31', '42'],
                    price=Price.pounds(3.20),
                    options=[
                        option(Price.pounds(4.20), Price.pounds(3.40)),
                        top_option,
                    ],
                ),
            ],
        ),
        wine=SubMenu(
            image=wine,
            menuItems=[],
        ),
        spirits=SubMenu(
            image=spirits,
            menuItems=[],
        ),
        cocktails=SubMenu(
            image=cocktails,
            menuItems=[],
        ),
        water=SubMenu(
            image=water,
            menuItems=[],
        ),
        # snacks=SubMenu(
        #     image=snacks,
        # ),
    )


############################################################################
# Mutation
############################################################################

class OrderItem(graphene.ObjectType):
    barID = BarID
    menuItemID = MenuItemID
    # e.g. [['pint'], ['lime']]
    selectedOptionStrings = graphene.List(graphene.String()).NonNull
    amount = graphene.Int().NonNull

characters = string.ascii_letters + '0123456789!?@*$+/|'

def shortid():
    return ''.join(random.sample(characters, 3))

class PlaceOrder(graphene.Mutation):
    class Input:
        userName = graphene.String().NonNull
        currency = graphene.String().NonNull
        price = graphene.Float().NonNull
        # orderList = graphene.List(OrderItem).NonNull
        stripeToken = graphene.String().NonNull

    errorMessage = graphene.String()
    queueSize = graphene.Int().NonNull
    estimatedTime = graphene.Int().NonNull
    receipt = graphene.String().NonNull
    userName = graphene.String().NonNull,
    # orderList = graphene.List(OrderItem).NonNull

    @classmethod
    def mutate(cls, instance, args, info):
        print("Placing Order:", args)
        assert args['currency'] in ['Sterling', 'Euros', 'Dollars']
        queueSize = 2
        return PlaceOrder(
            errorMessage=None,
            queueSize=queueSize,
            estimatedTime=queueSize * 90,
            receipt=shortid(),
        )

class Mutations(graphene.ObjectType):
    placeOrder = graphene.Field(PlaceOrder)

schema = graphene.Schema(query=Query, mutation=Mutations, executor=GeventExecutor())

if __name__ == '__main__':
    from flask import Flask
    from flask_graphql import GraphQLView
    app = Flask(__name__)
    app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))
    app.run(host='0.0.0.0', debug=True)
