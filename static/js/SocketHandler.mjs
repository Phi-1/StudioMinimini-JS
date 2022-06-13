import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"


export default (() => {

    let socket = undefined

    return {
        init: () => {
            socket = io()
        },
        emit: (event, data = undefined) => {
            if (data) {
                socket.emit(event, data)
                return
            }
            socket.emit(event)
        },
        listen: (event, callback) => {
            socket.on(event, callback)
        }
    }
})()