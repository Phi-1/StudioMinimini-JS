const { files } = require("./util")

const json_db = (() => {

    let db_data = { items: {}, store_text: "" }
    let db_path = ""

    async function save_db_data() {
        await files.write(db_path, JSON.stringify(db_data))
    }

    return {
        connect: async (filepath) => {
            const file_exists = await files.exists(filepath)
            db_path = filepath
            if (file_exists) {
                const data = await files.read(db_path)
                if (data) {
                    db_data = JSON.parse(data)
                } else {
                    console.error(`[DATABASE ERROR] Database file was read but no data was received, check integrity of file ${db_path}`)
                }
            } else {
                save_db_data()
            }
        },
        get_data: () => {
            return db_data
        },
        add_item: async (id, title, description, price, reserved, images) => {
            db_data.items[id] = {title, description, price, reserved, images}
            save_db_data()
        },
        delete_item: async (item_id) => {
            if (item_id in db_data.items) {
                delete db_data.items[item_id]
                save_db_data()
            }
        },
        set_reserved: async (item_id, reserved) => {
            if (!item_id in db_data.items) {
                return
            }
            db_data.items[item_id]["reserved"] = reserved
            save_db_data()
        },
        is_reserved: (item_id) => {
            if (!item_id in db_data.items) {
                return
            }
            return db_data.items[item_id]["reserved"]
        },
        set_store_text: (text) => {
            if (!typeof text == "string") return
            db_data.store_text = text
            save_db_data()
        },
        get_store_text: () => {
            return db_data.store_text
        }
    }
})()

module.exports = json_db