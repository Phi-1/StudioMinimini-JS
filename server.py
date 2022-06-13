from flask import Flask, request, redirect
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import mailjet_rest as mailjet
from dotenv import load_dotenv
import os
from uuid import uuid4
from src.json_db import JSON_DB as db
from src.json_db import Item
from src.admin import Admin
import src.util as util

# Globals
SERVER = Flask(__name__)
MAIL: mailjet.Client = None
SOCKET = SocketIO(SERVER)
CORS(SERVER)

# Routes
@SERVER.route("/", methods=["GET"])
def index():
    return util.read_html("static/index.html")


# Socket events
@SOCKET.on("request_items")
def send_items():
    emit("store_items", db.get_items(), broadcast=False)


@SOCKET.on("admin_login")
def admin_login(data):
    token = Admin.admin_login(data["password"])
    if token:
        emit("admin_login", {"token": token}, broadcast=False)


@SOCKET.on("add_item")
def add_item(data):
    if not Admin.check_token(data["admin_token"]):
        return

    item = data["item"]
    # Save images and get their names
    images = []
    for image_name, image_data in item["images"].items():
        saved_name = util.save_image(image_name, image_data)
        images.append(saved_name)
    # Format price into integer
    item_price = util.format_price(str(item["price"]))
    db.add_item(Item(str(uuid4()), item["title"], item["description"], item_price, False, images))
    emit("update", db.get_items(), broadcast=True)


@SOCKET.on("delete_item")
def delete_item(data):
    if not Admin.check_token(data["admin_token"]):
        return
    db.delete_item(data["item_id"])
    emit("update", db.get_items(), broadcast=True)


@SOCKET.on("reserve_item")
def reserve_item(data):
    item_id = data["item_id"]
    if not item_id:
        return
    if db.is_reserved(item_id):
        emit("reservation_failure", broadcast=False)
        return
    db.set_reserved(item_id, True)
    mail_success = util.send_reservation_notification(MAIL)
    if not mail_success:
        emit("reservation_failure", broadcast=False)
        db.set_reserved(item_id, False)
        return
    emit("reservation_success", broadcast=False)
    emit("update", db.get_items(), broadcast=True)


# Main
if __name__ == "__main__":
    load_dotenv()
    server_ip = os.environ.get("SERVER_IP")
    server_port = os.environ.get("SERVER_PORT")
    db_path = os.environ.get("DB_PATH")

    db.connect(db_path)
    Admin.set_password(os.environ.get("ADMIN_PASSWORD"))

    # Configure mailjet
    mail_api_key = os.environ.get("MAIL_API_KEY")
    mail_api_secret = os.environ.get("MAIL_API_SECRET")
    MAIL = mailjet.Client(auth=(mail_api_key, mail_api_secret), version="v3.1")

    SOCKET.run(SERVER, host="0.0.0.0", port=server_port, debug=True)