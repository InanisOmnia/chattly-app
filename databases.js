const localDB = require("node-localdb");



module.exports = (globalObj) => {
    return {
        webUsers: localDB("./data/webUsers.json"),
        apiUsers: localDB("./data/apiUsers.json"),
        houses: localDB("./data/houses.json")
    }
}