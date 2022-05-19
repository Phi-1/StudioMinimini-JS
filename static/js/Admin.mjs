import Classnames from "./Classnames.mjs"
import SocketHandler from "./SocketHandler.mjs"

export default class Admin {
    static admin_token = null

    static init(socket) {
        Admin._bind_events()
    }

    static admin_login(token) {
        Admin.admin_token = token
        // Make all admin-only elements visible
        document.querySelectorAll(`.${Classnames.admin.hidden}`).forEach((element, index) => {
            element.classList.remove(Classnames.admin.hidden)
        })
    }

    static get_token() {
        return Admin.admin_token
    }

    static _bind_events() {
        // ELements
        const btn_popup = document.querySelector(`.${Classnames.admin.button_login}`)
        const popup = document.querySelector(`.${Classnames.admin.popup}`)
        const form = document.querySelector(`.${Classnames.admin.form}`)
        const field_password = document.querySelector(`.${Classnames.admin.field_password}`)

        // Show password popup
        btn_popup.addEventListener("click", (event) => {
            popup.classList.toggle(Classnames.no_display)
            field_password.focus()
        })

        // Close popup when clicking out of it
        popup.addEventListener("click", (event) => {
            if (event.target == popup) {
                popup.classList.toggle(Classnames.no_display)
            }
        })

        // Send password to server on form submit
        form.addEventListener("submit", (event) => {
            event.preventDefault()
            const password = field_password.value
            SocketHandler.emit("admin_login", {password: password})
            field_password.value = ""
            popup.classList.toggle(Classnames.no_display)
        })

        // Listen for admin token
        SocketHandler.listen("admin_login", (data) => {
            Admin.admin_login(data["token"])
        })
    }

}