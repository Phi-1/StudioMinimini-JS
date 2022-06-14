require("dotenv").config()
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const db = require("./src/json_db")
const admin = require("./src/admin")
const { files, util } = require("./src/util")

// Server initialisation
const express = require("express")
const server = express()
const http = require("http").Server(server)
const io = require("socket.io")(http, {
    maxHttpSize: process.env["SOCKET_DATA_MAX_SIZE"]
})

server.use(cors())
server.use(express.static("static"))


// Server routes
server.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/index.html")
})

// Socket events
function on_request_items(socket) {
    socket.emit("store_items", db.get_items())
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
    io.emit("update", db.get_items())
}

function on_delete_item(socket, data) {
    if (!admin.check_token(socket.id, data["admin_token"])) return
    // Delete image files
    const images = db.get_items()["items"][data["item_id"]]["images"]
    images.forEach(async (image) => {
        await files.delete(`${__dirname}/${process.env["STORE_IMAGES_PATH"]}/${image}`)
    })
    db.delete_item(data["item_id"])
    io.emit("update", db.get_items())
}

function on_reserve_item(socket, data) {

}

io.on("connection", (socket) => {
    console.log("user connected")
    socket.on("request_items", () => { on_request_items(socket) })
    socket.on("admin_login", (data) => { on_admin_login(socket, data) })
    socket.on("add_item", (data) => { on_add_item(socket, data) })
    socket.on("delete_item", (data) => { on_delete_item(socket, data) })
    socket.on("reserve_item", (data) => { on_reserve_item(socket, data) })

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })
})


function main() {
    const port = 5555
    db.connect(process.env["DB_PATH"])
    admin.set_password(process.env["ADMIN_PASSWORD"])
    http.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
}

main()