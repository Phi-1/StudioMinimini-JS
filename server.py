from flask import Flask, request, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import os
from src.json_db import JSON_DB as db

SERVER = Flask(__name__)
CORS(SERVER)

def read_html(filepath):
    with open(filepath) as f:
        return f.read()

@SERVER.route("/", methods=["GET"])
def index():
    return read_html("static/index.html")

if __name__ == "__main__":
    load_dotenv()
    server_ip = os.environ.get("SERVER_IP")
    server_port = os.environ.get("SERVER_PORT")
    db_path = os.environ.get("DB_PATH")

    db.connect(db_path)

    SERVER.run("0.0.0.0", server_port, debug=True)