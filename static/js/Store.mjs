import Classnames from "./Classnames.mjs"


class StorePopup {
    // Elements
    static e_popup = document.querySelector(`.${Classnames.store_popup.window}`)
    static e_popup_body = document.querySelector(`.${Classnames.store_popup.body}`)
    static e_title = document.querySelector(`.${Classnames.store_popup.title}`)
    static e_description = document.querySelector(`.${Classnames.store_popup.description}`)
    static e_pricetag = document.querySelector(`.${Classnames.store_popup.pricetag}`)
    static e_button_close = document.querySelector(`.${Classnames.store_popup.button_close}`)
    static e_button_reserve = document.querySelector(`.${Classnames.store_popup.button_reserve}`)
    static e_form = document.querySelector(`.${Classnames.store_popup.form}`)
    static e_button_fullscreen = document.querySelector(`.${Classnames.store_popup.button_fullscreen}`)

    static init() {
        // close button event
        StorePopup.e_button_close.addEventListener("click", StorePopup.close_button_event)
        // fullscreen button event
        StorePopup.e_button_fullscreen.addEventListener("click", StorePopup.fullscreen_button_event)
    }

    static render(item_id, item_props) {
        // set element content
        StorePopup.e_popup.style["background-image"] = `url(static/img/store_items/${item_id}.png)`
        StorePopup.e_title.innerText = item_props["title"]
        StorePopup.e_description.innerText = item_props["description"]
        const price_string = String(item_props["price"]).slice(0, -2) + "," + String(item_props["price"]).slice(-2)
        StorePopup.e_pricetag.innerHTML = `&euro; ${price_string}`
        StorePopup.e_popup.classList.toggle(Classnames.no_display)
    }

    static close_button_event(event) {
        StorePopup.e_popup.classList.toggle(Classnames.no_display)
    }

    static fullscreen_button_event(event) {
        StorePopup.e_popup_body.classList.toggle(Classnames.no_display)
    }
}

export default class Store {
    static items = {}
    static e_grid = document.querySelector(`.${Classnames.store_grid}`)

    static init() {
        StorePopup.init()
    }

    static update(items) {
        Store.items = items
        Store.render()
    }

    static render() {
        // remove previous items
        while (Store.e_grid.lastElementChild) {
            Store.e_grid.removeChild(Store.e_grid.lastElementChild)
        }
        // add new items
        for (const item_id in Store.items) {
            const new_item = document.createElement("div")
            new_item.classList.add(Classnames.store_item)
            // set image
            new_item.style["background-image"] = `url(static/img/store_items/${item_id}.png)`
            // add click eventlistener
            new_item.addEventListener("click", Store.generate_click_event(item_id))
            Store.e_grid.appendChild(new_item)
        }
    }

    static generate_click_event(item_id) {
        return function(event) {
            StorePopup.render(item_id, Store.items[item_id])
        }    
    }

}