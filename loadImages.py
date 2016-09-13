import os
import glob
import shutil
import rethinkdb as r

try:
    os.mkdir('images')
except FileExistsError as e:
    pass

conn = r.connect()
itemDefs = r.db('qdodger').table('itemDefs')

images = (
    glob.glob('MenuImages/*.jpg')   +
    glob.glob('MenuImages/*.png')   +
    glob.glob('MenuImages/*/*.jpg') +
    glob.glob('MenuImages/*/*.png')
)

for filename in images:
    _, image = os.path.split(filename)
    image = image.strip()
    item_id, _ = os.path.splitext(image)
    shutil.copyfile(filename, os.path.join('static', image))
    result = itemDefs.get(item_id)                                \
                     .update({'images': ['/static/' + image]})    \
                     .run(conn)
    print(item_id, list(filter(result.get, result)))
