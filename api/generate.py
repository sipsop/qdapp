from curry.typing.javascript import to_javascript

from .bar import Bar
from .menu import Menu
from .order import Order

to_javascript([Bar, Menu, Order])
