from flask import Flask, request, redirect
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os

from numpy import broadcast
from src.json_db import JSON_DB as db
from src.admin import Admin

# Globals
SERVER = Flask(__name__)
SOCKET = SocketIO(SERVER)
CORS(SERVER)


# Util
def read_html(filepath):
    with open(filepath) as f:
        return f.read()


# Routes
@SERVER.route("/", methods=["GET"])
def index():
    return read_html("static/index.html")


# Socket events
@SOCKET.on("request_items")
def send_items():
    emit("store_items", db.get_items(), broadcast=False)

@SOCKET.on("admin_login")
def admin_login(data):
    token = Admin.admin_login(data["password"])
    if token:
        emit("admin_login", {"token": token}, broadcast=False)

@SOCKET.on("delete_item")
def delete_item(data):
    if not Admin.check_token(data["admin_token"]):
        return
    db.delete_item(data["item_id"])
    emit("update", db.get_items(), broadcast=True)

# Main
if __name__ == "__main__":
    load_dotenv()
    server_ip = os.environ.get("SERVER_IP")
    server_port = os.environ.get("SERVER_PORT")
    db_path = os.environ.get("DB_PATH")

    db.connect(db_path)
    Admin.set_password(os.environ.get("ADMIN_PASSWORD"))

    SOCKET.run(SERVER, host="0.0.0.0", port=server_port, debug=True)