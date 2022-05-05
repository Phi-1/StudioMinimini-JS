const itemGrid = document.querySelector(".store__items__grid")
const itemPopup = document.querySelector(".store__items__popup")

let req = new XMLHttpRequest()
req.onreadystatechange = responseHandler
req.open("GET", "http://localhost:3000/get-items", true)
req.send()

function responseHandler() {
    if (req.readyState === XMLHttpRequest.DONE) {
        const resJson = JSON.parse(req.responseText)
        renderStoreItems(resJson)
    }
}

function renderStoreItems(items) {
    if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
            const newItem = document.createElement("div")
            newItem.classList.add("store__items__grid__item")
            newItem.style.backgroundImage = `url("/../img/store-items/${items[i].id}.png")`
            addPopupEvent(items[i], newItem)
            itemGrid.appendChild(newItem)
        }
        return true
    }

    return false
}

function addPopupEvent(data, item) {

}

function eventPopup(event) {
    itemPopup.classList.remove("nodisplay")
}