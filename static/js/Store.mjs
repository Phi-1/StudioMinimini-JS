import Admin from "./Admin.mjs"
import Classnames from "./Classnames.mjs"
import SocketHandler from "./SocketHandler.mjs"


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

    static current_item_id = null
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
        // reserve button event
        SocketHandler.listen("reservation_success", () => console.log("reservation success"))
        SocketHandler.listen("reservation_failure", () => console.log("reservation failure"))
        StorePopup.e_button_reserve.addEventListener("click", StorePopup.reserve_item_event)
    }

    static render(item_id, item_props) {
        // set current item
        StorePopup.current_item_id = item_id
        // save item images
        StorePopup.current_item_images = item_props["images"]
        // set element content
        StorePopup.e_popup.style["background-image"] = `url(img/store_items/${item_props["images"][0]})`
        StorePopup.e_title.innerText = item_props["title"]
        StorePopup.e_description.innerText = item_props["description"]
        const price_string = (String(item_props["price"]).slice(0, -2).length > 0 ? String(item_props["price"]).slice(0, -2) : "0") + "," + String(item_props["price"]).slice(-2)
        StorePopup.e_pricetag.innerHTML = `&euro; ${price_string}`
        StorePopup.e_container.classList.toggle(Classnames.no_display)
    }

    static close_button_event(event) {
        StorePopup.current_item_id = null
        StorePopup.image_index = 0
        StorePopup.e_container.classList.toggle(Classnames.no_display)
    }

    static container_event(event) {
        if (event.target === StorePopup.e_container) {
            StorePopup.current_item_id = null
            StorePopup.image_index = 0
            StorePopup.e_container.classList.toggle(Classnames.no_display)
        }
    }

    static fullscreen_button_event(event) {
        StorePopup.e_popup_body.classList.toggle(Classnames.no_display)
    }

    static arrow_left_event(event) {
        if (StorePopup.image_index == 0) { StorePopup.image_index = StorePopup.current_item_images.length - 1 }
        else { StorePopup.image_index-- }
        StorePopup.e_popup.style["background-image"] = `url(img/store_items/${StorePopup.current_item_images[StorePopup.image_index]})`
    }

    static arrow_right_event(event) {
        if (StorePopup.image_index == StorePopup.current_item_images.length - 1) { StorePopup.image_index = 0 }
        else { StorePopup.image_index++ }
        StorePopup.e_popup.style["background-image"] = `url(img/store_items/${StorePopup.current_item_images[StorePopup.image_index]})`
    }

    static reserve_item_event(event) {
        event.preventDefault()
        if (!StorePopup.current_item_id) { return }
        const customer_email = document.getElementById("input-email").value
        console.log(customer_email)
        // Check if somewhat valid email
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(customer_email)) {
            alert("Please enter a valid email address")
            return
        }

        SocketHandler.emit("reserve_item", {item_id: StorePopup.current_item_id, customer_email})
    }
}

export default class Store {
    static items = {}
    static e_grid = document.querySelector(`.${Classnames.store_grid}`)

    static init() {
        // Listen for store updates
        SocketHandler.listen("store_data", (data) => {
            Store.update(data["items"], data["store_text"])
        })
        SocketHandler.listen("update", (data) => {
            Store.update(data["items"], data["store_text"])
            Admin.on_store_update()
        })
        // Request items from server
        SocketHandler.emit("request_store_data")
        // Set up store popup
        StorePopup.init()
        // Bind add item button
        document.querySelector(`.${Classnames.store_item_add.btn_add}`).addEventListener("click", Store.add_item_button_event)
        // Bind add item popup close event
        document.querySelector(`.${Classnames.store_item_add.popup_container}`).addEventListener("click", Store.add_item_popup_event)
        // Bind add item form submit event
        document.querySelector(`.${Classnames.store_item_add.popup_form}`).addEventListener("submit", Store.add_item_form_event)
        // Bind edit store text button
        document.querySelector(`.${Classnames.store_description.btn_edit}`).addEventListener("click", Store.edit_store_text_event)
        // Bind edit store text popup close event
        document.querySelector(`.${Classnames.store_description.popup}`).addEventListener("click", Store.edit_store_text_popup_event)
        // Bind edit store text form event
        document.querySelector(`.${Classnames.store_description.form}`).addEventListener("submit", Store.edit_store_text_form_event)
    }

    static update(items, store_text) {
        Store.items = items
        document.querySelector(`.${Classnames.store_description.text}`).innerHTML = store_text
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
            new_item.style["background-image"] = `url(img/store_items/${Store.items[item_id]["images"][0]})`
            // add click eventlistener
            if (!Store.items[item_id]["reserved"]) {
                new_item.addEventListener("click", Store.generate_click_event(item_id))
            } else {
                new_item.classList.add(Classnames.store_item_reserved)
            }
            // add admin-only delete button
            const btn_delete = document.createElement("div")
            btn_delete.classList.add(Classnames.store_item_btn_delete)
            btn_delete.classList.add(Classnames.admin.hidden)
            btn_delete.addEventListener("click", Store.generate_delete_event(item_id))
            new_item.appendChild(btn_delete)
            // add admin-only reset button
            const btn_reset = document.createElement("div")
            btn_reset.classList.add(Classnames.store_item_btn_reset)
            btn_reset.classList.add(Classnames.admin.hidden)
            btn_reset.addEventListener("click", Store.generate_reset_event(item_id))
            new_item.appendChild(btn_reset)
            
            Store.e_grid.appendChild(new_item)
        }
    }

    static generate_click_event(item_id) {
        return function(event) {
            // Prevent bubbling
            if (event.target.classList.contains(Classnames.store_item)) {
                StorePopup.render(item_id, Store.items[item_id])
            }
        }    
    }

    static generate_delete_event(item_id) {
        return function(event) {
            if (window.confirm("Are you sure you want to delete this item?")) {
                SocketHandler.emit("delete_item", {item_id: item_id, admin_token: Admin.get_token()})
            }  
        }
    }

    static generate_reset_event(item_id) {
        return function(event) {
            if (window.confirm("Are you sure you want to reset this item?")) {
                SocketHandler.emit("reset_item", {item_id: item_id, admin_token: Admin.get_token()})
            }  
        }
    }

    static add_item_button_event(event) {
        document.querySelector(`.${Classnames.store_item_add.popup_container}`).classList.toggle(Classnames.no_display)
        document.querySelector(`.${Classnames.store_item_add.input_title}`).focus()
    }

    static add_item_popup_event(event) {
        const popup = document.querySelector(`.${Classnames.store_item_add.popup_container}`)
        if (event.target != popup) { return }
        popup.classList.toggle(Classnames.no_display)
    }

    static async add_item_form_event(event) {
        event.preventDefault()
        const title = document.querySelector(`.${Classnames.store_item_add.input_title}`).value
        const description = document.querySelector(`.${Classnames.store_item_add.input_description}`).value
        const price = document.querySelector(`.${Classnames.store_item_add.input_price}`).value
        const image_files = document.querySelector(`.${Classnames.store_item_add.input_images}`).files
        const images = {}
        // To ensure that the images load properly each needs to be less than 4MB
        for (let i = 0; i < image_files.length; i++) {
            const image = image_files[i]
            if (image.size > 8388608) {
                alert("Please limit each of your files to 8MB and try again")
                return
            }
            images[image.name] = await image.arrayBuffer()
        }
        SocketHandler.emit("add_item", {admin_token: Admin.get_token(), item: {title, description, price, images}})
        // Close form
        document.querySelector(`.${Classnames.store_item_add.popup_container}`).classList.toggle(Classnames.no_display)
    }

    static edit_store_text_event(event) {
        document.querySelector(`.${Classnames.store_description.popup}`).classList.toggle(Classnames.no_display)
        document.querySelector(`.${Classnames.store_description.textarea}`).focus()
    }

    static edit_store_text_popup_event(event) {
        const popup = document.querySelector(`.${Classnames.store_description.popup}`)
        if (event.target != popup) return
        popup.classList.toggle(Classnames.no_display)
    }

    static edit_store_text_form_event(event) {
        event.preventDefault()
        const new_store_text = document.querySelector(`.${Classnames.store_description.textarea}`).value
        if (!new_store_text) return
        SocketHandler.emit("set_store_text", { admin_token: Admin.get_token(), store_text: new_store_text })
        document.querySelector(`.${Classnames.store_description.popup}`).classList.toggle(Classnames.no_display)
    }

}