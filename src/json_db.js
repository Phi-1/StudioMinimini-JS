const { files } = require("./util")

const json_db = (() => {

    let db_data = { items: {} }
    let db_path = ""

    async function save_data() {
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
                save_data()
            }
        },

        get_items: () => {
            return db_data
        },

        add_item: async (id, title, description, price, reserved, images) => {
            db_data.items[id] = {title, description, price, reserved, images}
            save_data()
        },

        delete_item: async (id) => {
            delete db_data.items[id]
            save_data()
        }
    }
})()

module.exports = json_db