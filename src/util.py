from uuid import uuid4
import os
import re


def read_html(filepath):
    with open(filepath) as f:
        return f.read()


def save_image(image_name, image_data) -> str:
    """Saves image under unique name. Returns name."""
    images_folder = os.environ.get("STORE_IMAGES_PATH")
    image_type = image_name.split(".")[-1]
    unique_name = str(uuid4())
    with open(f"./{images_folder}/{unique_name}.{image_type}", "wb") as file:
        file.write(image_data)
    return f"{unique_name}.{image_type}"


def format_price(price_str: str) -> int:
    """Returns an integer of the price in cents"""
    # Get rid of currency signs and random characters, but keep decimal point or comma
    price_str = re.sub(r"[^\d\.,]", "", price_str)
    # If there is a comma or decimal point, treat price differently based on number of digits after decimal point
    decimal_split = re.split(r"[\.,]+", price_str)
    price_str_final = ""
    if len(decimal_split) > 1:
        # Use last chunk after a comma or decimal point as cents
        decimal_values = decimal_split[-1]
        if len(decimal_values) == 1:
            decimal_values += "0"
        elif len(decimal_values) > 2:
            decimal_values = decimal_values[:2]
        elif len(decimal_values) == 0:
            decimal_values = "00"
        # Assemble final price
        for i in range(len(decimal_split) - 1):
            price_str_final += decimal_split[i]
        price_str_final += decimal_values
    else:
        price_str_final = price_str + "00"

    return int(price_str_final)