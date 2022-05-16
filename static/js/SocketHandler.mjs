import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

export default class SocketHandler {
    static socket = null

    static init() {
        SocketHandler.socket = io()
    }

    static emit(event, data = undefined) {
        if (data) {
            SocketHandler.socket.emit(event, data)
            return
        }
        SocketHandler.socket.emit(event)
    }

    static listen(event, callback) {
        SocketHandler.socket.on(event, callback)
    }
}