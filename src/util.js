const fs = require("fs")

const files = (() => {

    return {
        exists: (filepath) => {
            return new Promise((resolve, reject) => {
                fs.access(filepath, fs.constants.F_OK, (failed) => {
                    if (failed) {
                        return resolve(false)
                    }
                    return resolve(true)
                })
            })
        },
        read: (filepath) => {
            return new Promise((resolve, reject) => {
                fs.readFile(filepath, (err, data) => {
                    if (err) {
                        console.log(err)
                        return resolve()
                    }
                    return resolve(data)
                })
            })
        },
        write: (filepath, data) => {
            return new Promise((resolve, reject) => {
                fs.writeFile(filepath, data, (err) => {
                    if (err) {
                        console.log(err)
                        return resolve(false)
                    }
                    return resolve(true)
                })
            })
        }
    }
})()

module.exports = { files }