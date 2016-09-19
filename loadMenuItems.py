import yaml
import uuid
from curry import fmap, chunking
from curry.typing import alias, typeddict, URL

from qd import model

fresh_id = uuid.uuid4

ItemID = alias('ItemID', str)
TagName = alias('TagName', str)

Drink = typeddict(
    [ ('name',  str)
    , ('desc',  str)
    , ('image', URL)
    , ('abv',   str)
    , ('tags',  str)
    ], name='Drink')

Drinks = { ItemID: Drink }

Contents = typeddict(
    [ ('drinks', Drinks)
    ], name='Contents')

def tag_to_tag_id(tag_name):
    return tag_name

def prepare_item(item_name, item):
    images = []
    if item.get('image') or item.get('images'):
        images = item.get('image') or item.get('images')
        images = fmap(str.strip, images.split())

    if 'name' not in item or 'desc' not in item or 'tags' not in item:
        raise ValueError("Invalid item with name " + item_name)

    return {
        'id':       item_name,
        'name':     item['name'],
        'desc':     item['desc'],
        'images':   images,
        'tags':     fmap(tag_to_tag_id, filter(bool, item['tags'].split())),
    }

def load_items_from_file(contents, dry_run=False):
    drink_list = contents['drinks']
    results = [prepare_item(item_name, item)
                   for item_name, item in drink_list.items()]
    if not dry_run:
        model.run(model.MenuItemDefs.delete())
        model.run(model.MenuItemDefs.insert(results))

if __name__ == '__main__':
    yaml_file = yaml.load(open('drinks.yaml'))
    load_items_from_file(yaml_file, dry_run=False)
