import os
import glob
import shutil

from qd import model

try:
    os.mkdir('images')
except FileExistsError as e:
    pass


def process_images():
    images = (
        glob.glob('images/*.jpg') +
        glob.glob('images/*.png')
    )

    for filename in images:
        _, image = os.path.split(filename)
        shutil.copyfile(filename, os.path.join('static', image))

def process_menu_images():
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
        result = model.run(
            model.MenuItemDefs
                .get(item_id)
                .update({'images': ['/static/' + image]})
        )
        print(item_id, list(filter(result.get, result)))

def main():
    process_images()
    process_menu_images()

main()
