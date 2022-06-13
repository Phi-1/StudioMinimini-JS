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
        },
        get_file_ext: (filename) => {
            const split = filename.split(".")
            return split[split.length - 1]
        }
    }
})()

const util = (() => {

    return {
        format_price: (price_str) => {
            // Returns an integer of the price in cents
            // Get rid of currency signs and random characters, but keep decimal point or comma
            price_str = price_str.replace("[^\d\.,]", "")
            // If there is a comma or decimal point, treat price differently based on number of digits after decimal point
            const decimal_split = price_str.split("[\.,]+")
            let price_str_final = ""
            if (decimal_split.length > 1) {
                // Use last chunk after a comma or decimal point as cents
                let decimal_values = decimal_split[decimal_split.length - 1]
                if (decimal_values.length == 1) {
                    decimal_values += "0"
                } else if (decimal_values.length > 2) {
                    decimal_values = decimal_values.slice(0, 2)
                } else if (decimal_values.length == 0) {
                    decimal_values = "00"
                }
                // Assemble final price
                for (let i = 0; i < decimal_split.length - 1; i++) {
                    price_str_final += decimal_split[i]
                }
                price_str_final += decimal_values
            } else {
                price_str_final = price_str + "00"
            }
            return parseInt(price_str_final)
        }
    }
})()


module.exports = { files, util }