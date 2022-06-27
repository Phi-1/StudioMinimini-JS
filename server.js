require("dotenv").config()
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const db = require("./src/json_db")
const admin = require("./src/admin")
const { files, util, mail } = require("./src/util")

// Server initialisation
const express = require("express")
const server = express()
const http = require("http").Server(server)
const io = require("socket.io")(http, {
    maxHttpBufferSize: process.env["SOCKET_MAX_DATA_SIZE"]
})

server.use(cors())
server.use(express.static("static"))


// Server routes
server.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/index.html")
})

// Socket events
function on_request_store_data(socket) {
    socket.emit("store_data", db.get_data())
}

function on_admin_login(socket, data) {
    const token = admin.admin_login(data["password"], socket.id)
    if (token) {
        socket.emit("admin_login", {token})
    }    
}

async function on_add_item(socket, data) {
    if (!admin.check_token(socket.id, data["admin_token"])) return
    const item = data["item"]
    const image_names = []
    for (image_name in data["item"]["images"]) {
        const image_id = uuidv4()
        const file_extension = files.get_file_ext(image_name)
        await files.write(`${__dirname}/${process.env["STORE_IMAGES_PATH"]}/${image_id}.${file_extension}`, data["item"]["images"][image_name])
        image_names.push(`${image_id}.${file_extension}`)
    }
    const item_price = util.format_price(String(item["price"]))
    db.add_item(uuidv4(), item["title"], item["description"], item_price, false, image_names)
    io.emit("update", db.get_data())
}

function on_delete_item(socket, data) {
    if (!admin.check_token(socket.id, data["admin_token"])) return
    // Delete image files
    const images = db.get_data()["items"][data["item_id"]]["images"]
    images.forEach(async (image) => {
        await files.delete(`${__dirname}/${process.env["STORE_IMAGES_PATH"]}/${image}`)
    })
    db.delete_item(data["item_id"])
    io.emit("update", db.get_data())
}

function on_reserve_item(socket, data) {
    const item_id = data["item_id"]
    if (!item_id) return
    if (db.is_reserved(item_id)) {
        socket.emit("reservation_failure")
        return
    }
    db.set_reserved(item_id, true)
    const item = db.get_data().items[item_id]
    mail.send_reservation_notification(item["title"], item["price"], data["customer_email"])
    io.emit("update", db.get_data())
}

function on_set_store_text(socket, data) {
    if (!admin.check_token(socket.id, data["admin_token"])) return
    db.set_store_text(data["store_text"])
    io.emit("update", db.get_data())
}

function on_reset_item(socket, data) {
    if (!admin.check_token(socket.id, data["admin_token"])) return
    db.set_reserved(data["item_id"], false)
    io.emit("update", db.get_data())
}

io.on("connection", (socket) => {
    console.log("user connected")
    socket.on("request_store_data", () => { on_request_store_data(socket) })
    socket.on("admin_login", (data) => { on_admin_login(socket, data) })
    socket.on("add_item", (data) => { on_add_item(socket, data) })
    socket.on("delete_item", (data) => { on_delete_item(socket, data) })
    socket.on("reserve_item", (data) => { on_reserve_item(socket, data) })
    socket.on("set_store_text", (data) => { on_set_store_text(socket, data) })
    socket.on("reset_item", (data) => { on_reset_item(socket, data) })

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })
})


function main() {
    const port = 5555
    db.connect(process.env["DB_PATH"])
    admin.set_password(process.env["ADMIN_PASSWORD"])
    mail.init()
    http.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
}

main()