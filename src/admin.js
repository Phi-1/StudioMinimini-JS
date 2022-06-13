const { v4: uuidv4 } = require("uuid")

const admin = (() => {

    // Contains active admin tokens as values bound to socket user ids as keys
    const active_admins = {}
    let admin_password = undefined

    return {
        set_password: (password) => {
            if (admin_password === undefined) {
                admin_password = password
            }
        },
        admin_login: (password, user_id) => {
            if (password === admin_password) {
                const token = uuidv4()
                active_admins[user_id] = token
                return token
            }
            return undefined
        },
        user_disconnect: (user_id) => {
            if (user_id in active_admins) {
                delete active_admins[user_id]
            }
        },
        check_token: (user_id, token) => {
            return active_admins[user_id] === token
        }
    }
})()

module.exports = admin