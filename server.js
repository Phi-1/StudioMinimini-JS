const express = require("express")
const server = express()
const http = require("http").Server(server)
const io = require("socket.io")(http)
const cors = require("cors")
const db = require("./src/json_db")
require("dotenv").config()


server.use(cors())
server.use(express.static("static"))


// Server routes
server.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/index.html")
    console.log("test")
})

// Socket events
io.on("request_items", (socket) => {

})


function main() {
    const port = 5555
    db.connect(process.env["DB_PATH"])
    http.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })
}

main()