const dirTrawlPackageObj = require("./utility/dirTrawlPackageObj");

(async function () {
    let globalObj = {
        config: {...dirTrawlPackageObj("./config", ".js"), ...dirTrawlPackageObj("./config", ".json")},
        database: {
            conn: await require("mariadb").createConnection({
                ...(function () {
                    if (process.env.NODE_ENV === "production") {
                        return {socketPath: "/run/mysqld/mysqld.sock", user: "localRoot", database: "chattly"}
                    } else {
                        return {
                            host: "192.168.1.128",
                            user: "chattlyClient",
                            password: "theAgeOfInfo",
                            database: "chattly"
                        }
                    }
                }())
            })
        },
        logger: require("./logger").setup()
    }

    const webserverProps = await require("./webserver").setup(globalObj);
    const socketServerProps = await require("./socketServer").setup(globalObj, webserverProps);
}());
