import Classnames from "./Classnames.mjs"


class StorePopup {
    // Elements
    static e_container = document.querySelector(`.${Classnames.store_popup.container}`)
    static e_popup = document.querySelector(`.${Classnames.store_popup.window}`)
    static e_popup_body = document.querySelector(`.${Classnames.store_popup.body}`)
    static e_title = document.querySelector(`.${Classnames.store_popup.title}`)
    static e_description = document.querySelector(`.${Classnames.store_popup.description}`)
    static e_pricetag = document.querySelector(`.${Classnames.store_popup.pricetag}`)
    static e_button_close = document.querySelector(`.${Classnames.store_popup.button_close}`)
    static e_button_reserve = document.querySelector(`.${Classnames.store_popup.button_reserve}`)
    static e_form = document.querySelector(`.${Classnames.store_popup.form}`)
    static e_button_fullscreen = document.querySelector(`.${Classnames.store_popup.button_fullscreen}`)
    static e_arrow_left = document.querySelector(`.${Classnames.store_popup.arrow_left}`)
    static e_arrow_right = document.querySelector(`.${Classnames.store_popup.arrow_right}`)

    static current_item_images = []
    static image_index = 0


    static init() {
        // close button event
        StorePopup.e_button_close.addEventListener("click", StorePopup.close_button_event)
        // fullscreen button event
        StorePopup.e_button_fullscreen.addEventListener("click", StorePopup.fullscreen_button_event)
        // image carousel arrows
        StorePopup.e_arrow_left.addEventListener("click", StorePopup.arrow_left_event)
        StorePopup.e_arrow_right.addEventListener("click", StorePopup.arrow_right_event)
        StorePopup.e_container.addEventListener("click", StorePopup.container_event)
    }

    static render(item_id, item_props) {
        // save item images
        StorePopup.current_item_images = item_props["images"]
        // set element content
        StorePopup.e_popup.style["background-image"] = `url(static/img/store_items/${item_props["images"][0]})`
        StorePopup.e_title.innerText = item_props["title"]
        StorePopup.e_description.innerText = item_props["description"]
        const price_string = String(item_props["price"]).slice(0, -2) + "," + String(item_props["price"]).slice(-2)
        StorePopup.e_pricetag.innerHTML = `&euro; ${price_string}`
        StorePopup.e_container.classList.toggle(Classnames.no_display)
    }

    static close_button_event(event) {
        StorePopup.e_container.classList.toggle(Classnames.no_display)
    }

    static container_event(event) {
        if (event.target === StorePopup.e_container) {
            StorePopup.e_container.classList.toggle(Classnames.no_display)
        }
    }

    static fullscreen_button_event(event) {
        StorePopup.e_popup_body.classList.toggle(Classnames.no_display)
    }

    static arrow_left_event(event) {
        if (StorePopup.image_index == 0) { StorePopup.image_index = StorePopup.current_item_images.length - 1 }
        else { StorePopup.image_index-- }
        StorePopup.e_popup.style["background-image"] = `url(static/img/store_items/${StorePopup.current_item_images[StorePopup.image_index]})`
    }

    static arrow_right_event(event) {
        if (StorePopup.image_index == StorePopup.current_item_images.length - 1) { StorePopup.image_index = 0 }
        else { StorePopup.image_index++ }
        StorePopup.e_popup.style["background-image"] = `url(static/img/store_items/${StorePopup.current_item_images[StorePopup.image_index]})`
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
            new_item.style["background-image"] = `url(static/img/store_items/${Store.items[item_id]["images"][0]})`
            // add click eventlistener
            if (!Store.items[item_id]["reserved"]) {
                new_item.addEventListener("click", Store.generate_click_event(item_id))
            }    
            Store.e_grid.appendChild(new_item)
        }
    }

    static generate_click_event(item_id) {
        return function(event) {
            StorePopup.render(item_id, Store.items[item_id])
        }    
    }

}