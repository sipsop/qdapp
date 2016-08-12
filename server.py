# from collections import OrderedDict

# from graphql.execution.executor import Executor
# from graphql.execution.middlewares.gevent import GeventExecutionMiddleware, run_in_greenlet
from graphql.execution.executors.gevent import GeventExecutor #, run_in_greenlet

import graphene

ID  = graphene.ID().NonNull
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


class MenuItemOption(graphene.ObjectType):
    # menu option name (e.g. "Size")
    name    = graphene.String().NonNull

    # List of options to choose from, e.g. ["pint", "half-pint"]
    optionList = graphene.List(graphene.String()).NonNull

    # List of prices for each option, e.g. [Price(3.40), Price(2.60)]
    prices  = graphene.List(Price).NonNull

    # Default option, e.g. "pint". If not present, pick the first entry
    # from `options`.
    default = graphene.String()

class MenuItem(graphene.ObjectType):
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

class OpeningTime(graphene.ObjectType):
    day = graphene.NonNull(Day)
    openTime = graphene.Field(Time)
    closeTime = graphene.Field(Time)

class Address(graphene.ObjectType):
    lat = graphene.Float().NonNull
    lon = graphene.Float().NonNull
    city = graphene.String().NonNull
    street = graphene.String().NonNull
    number = graphene.String().NonNull
    postcode = graphene.String().NonNull

class Bar(graphene.ObjectType):
    id     = ID
    name   = graphene.String().NonNull
    desc   = graphene.String()
    images = graphene.List(URL).NonNull
    tags   = graphene.List(graphene.String().NonNull)
    openingTimes = graphene.List(OpeningTime).NonNull
    address = graphene.NonNull(Address)
    menu   = graphene.Field(Menu)

    def resolve_menu(self, args, info):
        return menu

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
        TagInfo('0', '#beer',       excludes=['1', '2', '3', '4']),
        TagInfo('1', '#wine',       excludes=['0', '2', '3', '4']),
        TagInfo('2', '#spirits',    excludes=['0', '1', '3', '4']),
        TagInfo('3', '#cocktails',  excludes=['0', '1', '2', '4']),
        TagInfo('4', '#water',      excludes=['0', '1', '2', '3']),
        TagInfo('20', '#stout',     excludes=['21']),
        TagInfo('21', '#ale',       excludes=['20']),
        TagInfo('22', '#tap',       excludes=['23']),
        TagInfo('23', '#bottle',    excludes=['22']),
    ],
    tagGraph=[
        TagEdge(srcID='0', dstID='20'),
        TagEdge(srcID='0', dstID='21'),
        TagEdge(srcID='0', dstID='22'),
        TagEdge(srcID='0', dstID='23'),
    ],
)

class Query(graphene.ObjectType):

    bar  = graphene.Field(Bar, id=ID)
    barListTags = graphene.Field(Tags)
    menuTags = graphene.Field(Tags)

    def resolve_bar(self, args, info):
        id = args['id']
        if id != '1':
            raise ValueError("Expected id=1")
        print("returning bar!", args)
        return Bar(
            id=id,
            name='The Eagle',
            desc='''
                The Eagle is a traditional English pub dating back to the 16th
                century, serving breakfast, lunch and evening meals.
            ''',
            images=[outsideURL, insideURL],
            tags=['#pub', '#traditional', '#lunch', '#dinner'],
            openingTimes=[
                OpeningTime(
                    day=Day.Friday,
                    openTime=Time(hour=11, minute=0),
                    closeTime=Time(23, minute=30),
                ),
            ],
            address=Address(
                lat=0.0,
                lon=0.0,
                city='Cambridge',
                street='Benet Street',
                number='8',
                postcode='CB2 3QN',
                )
            )

    def resolve_menuTags(self, args, info):
        return menuTags


beer = "http://www.menshealth.com/sites/menshealth.com/files/styles/slideshow-desktop/public/images/slideshow2/beer-intro.jpg?itok=hhBQBwWj"
wine = "https://employee.foxandhound.com/Portals/0/images/slideshow/wine-pour-slide2.jpg"
spirits = "https://biotechinasia.files.wordpress.com/2015/10/two-whisky-glasses.jpg"
cocktails = "http://notable.ca/wp-content/uploads/2015/06/canada-day-cocktails.jpg"
water = "http://arogyam.zest.md/uploads/gallery/df4fe8a8bcd5c95cdb640aa9793bb32b/images/201212042159565.jpg"
snacks = "https://www.google.co.uk/search?q=peanuts&client=ubuntu&hs=sBq&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiT_47KnLnOAhXJuRoKHaNqD7QQ_AUICCgB&biw=1920&bih=919#tbm=isch&q=snacks&imgrc=sjXgiZ2yIgbsCM%3A"
guiness = "https://i.kinja-img.com/gawker-media/image/upload/s--neYeJnUZ--/c_fit,fl_progressive,q_80,w_636/zjlpotk0twzrtockzipu.jpg"

menu = Menu(
    beer=SubMenu(
        image=beer,
        menuItems=[
            MenuItem(
                name="Guiness",
                desc="Guiness is a dry irish stout",
                images=[guiness],
                tags=["#stout", "#irish"],
                price=Price.pounds(3.40),
                options=[
                    MenuItemOption(
                        name="Size",
                        optionList=[
                            "pint",
                            "half-pint",
                        ],
                        prices=[
                            Price.pounds(3.40),
                            Price.pounds(2.60),
                        ],
                        default="pint",
                    ),
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


schema = graphene.Schema(query=Query, executor=GeventExecutor())
query = '''
    query {
        bar(id: "1") {
            id
            name
            address {
                lat
                lon
                city
                street
                number
                postcode
            }
        }
    }
'''
# result = schema.execute(query)
# print(result.data['bar'])

print("===========================")
result = schema.execute(query)
print(result.data)
print("===========================")

from flask import Flask
from flask_graphql import GraphQLView
app = Flask(__name__)
app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))
app.run(host='0.0.0.0', debug=True)
