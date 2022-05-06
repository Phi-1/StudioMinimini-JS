export default class Store {
    static items = {}
    static e_item_grid = undefined
    static e_item_popup = undefined

    static init(item_grid, item_popup) {
        Store.e_item_grid = item_grid
        Store.e_item_popup = item_popup
    }

    static update(items) {
        Store.items = items
        Store.render()
    }

    static render() {
        // remove previous items
        while (Store.e_item_grid.lastElementChild) {
            Store.e_item_grid.removeChild(Store.e_item_grid.lastElementChild)
        }
        // add new items
        for (const item_id in Store.items) {
            const new_item = document.createElement("div")
            new_item.classList.add("store__items__grid__item")
            // set image
            new_item.style["background-image"] = `url(static/img/store_items/${item_id}.png)`
            // add click eventlistener
            new_item.addEventListener("click", Store.item_click_event)
            Store.e_item_grid.appendChild(new_item)
        }
    }

    static item_click_event(event) {
        Store.e_item_popup.classList.toggle("nodisplay")
    }

}