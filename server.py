from flask import Flask, request, redirect
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os
from src.json_db import JSON_DB as db

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

# Main
if __name__ == "__main__":
    load_dotenv()
    server_ip = os.environ.get("SERVER_IP")
    server_port = os.environ.get("SERVER_PORT")
    db_path = os.environ.get("DB_PATH")

    db.connect(db_path)

    SOCKET.run(SERVER, host="0.0.0.0", port=server_port, debug=True)