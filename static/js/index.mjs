import Admin from "./Admin.mjs"
import Classnames from "./Classnames.mjs"
import SocketHandler from "./SocketHandler.mjs"
import Store from "./Store.mjs"

function main() {
    SocketHandler.init()
    Store.init()
    Admin.init()
}

main()