import Classnames from "./Classnames.mjs"
import Store from "./Store.mjs"

const socket = io()

socket.on("store_items", (data) => {
    Store.update(data["items"])
})

function main() {
    Store.init()   
    socket.emit("request_items")
}

main()