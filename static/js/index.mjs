import Store from "./Store.mjs"

const socket = io()

socket.on("store_items", (data) => {
    Store.update(data["items"])

})

function main() {
    const e_item_grid = document.querySelector(".store__items__grid")
    const e_item_popup = document.querySelector(".store__items__popup")
    Store.init(e_item_grid, e_item_popup)
    
    socket.emit("request_items")
}

main()