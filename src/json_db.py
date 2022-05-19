from dataclasses import dataclass
import json
import os

@dataclass
class Item:
    id: str
    title: str
    description: str
    price: int #price in cents

class JSON_DB:
    FILEPATH = None
    # Keeps copy of data locally for faster reading
    # This is updated first, and then written to file on any change
    DATA = {
        "items": {
            "item-id": {
                "title": "test item",
                "description": "this is a test",
                "price": 34_01,
                "images": ["testitem.png"]
            }
        }
    }

    @staticmethod
    def save_data():
        with open(JSON_DB.FILEPATH, "w") as f:
            f.write(json.dumps(JSON_DB.DATA))

    @staticmethod
    def connect(filepath):
        # Bugs out when file exists but doesn't have a valid data structure
        JSON_DB.FILEPATH = filepath
        if os.path.exists(JSON_DB.FILEPATH):
            with open(JSON_DB.FILEPATH, "r") as f:
                JSON_DB.DATA = json.loads(f.read())
        else:
            JSON_DB.save_data()

    @staticmethod
    def add_item(item: Item):
        JSON_DB.DATA["items"][item.id] = {"title": item.title, "description": item.description, "price": item.price}
        JSON_DB.save_data()

    @staticmethod
    def delete_item(item_id):
        if not item_id in JSON_DB.DATA["items"]:
            return
        del JSON_DB.DATA["items"][item_id]
        JSON_DB.save_data()

    @staticmethod
    def get_items():
        return JSON_DB.DATA
