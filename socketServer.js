const Snowflake = require("./structures/Snowflake");
module.exports.setup = async(globalObj, webServer) => {
    const socketIo = require("socket.io");
    const io = socketIo.listen(webServer.server, {
        path: "/app",
        serveClient: true,
        pingInterval: 10000,
        pingTimeout: 5000
    });

    const allowedOrigins = ["http://localhost:3000/app"]
    io.origins((origin, callback) => {
        if (!allowedOrigins.some((cfgOrigin) => cfgOrigin === origin)) {
            return callback('origin not allowed', false);
        }
        callback(null, true);
    }); // origin needs to match public url - small layer of security

    // Wrap the express middleware - allows for verification via cookies
    const sessionMiddleware = require("./middlewares/session");
    io.use(function(socket, next) {
        sessionMiddleware(socket.request, {}, next);
    });

    io.on("connection", async(socket) => {
        if (!socket.request.session.passport.user) { socket.disconnect(true); }
        const [dbUser] = await globalObj.database.conn.query(`SELECT * FROM users WHERE id='${socket.request.session.passport.user}'`);
        const user = jsonifySqlUser(dbUser);
        let socketUser = {};
        // console.log(`User confirmed ${user.name}#${user.discrim} connected`);

        socket.on("IDENTIFY", (cb) => {
            cb(readyUserForClient(user));
        });

        socket.on("SELECT_ROOM", async(data, cb) => {
            const [room] = await globalObj.database.conn.query(`SELECT * FROM rooms WHERE id='${data.roomId}'`);
            if (!room) {
                return cb({
                    status: 404,
                    message: "Room by that ID could not be found"
                });
            }
            // TODO: check user is a member of that room
            // if(!member) {
            //     return cb({
            //         status: 403,
            //         message: "This room is restricted from the requested user"
            //     });
            // }
            socket.leave(socketUser.room);
            socket.join(room.id);
            socketUser.room = room.id;
            return cb({
                status: 200,
                message: "Joined room"
            })
        });

        socket.on("ROOM_CREATE", (data, cb) => {


        });

        socket.on("MESSAGE_CREATE", async(data, cb) => {
            // TODO: content parsing
            if (!data.content) {
                return cb({
                    status: 400,
                    message: "Malformed content, content may be empty or consist of entirely unsupported characters"
                });
            }
            const messageId = Snowflake.generate();
            // TODO: insert messages into db
            // await globalObj.database.conn.query(`INSERT INTO messages(id, roomId, authorId, content) VALUES(?, ?, ?, ?)`, [messageId, socketUser.roomId, user.id, data.content])
            // TODO: "io" needs to be changed if I use namespaces
            io.to(socketUser.room).emit("MESSAGE_CREATE", {
                userId: user.id,
                id: messageId,
                content: data.content
            });
            return cb({
                status: 200
            });
        });


        // when the client emits 'typing', we broadcast it to others
        socket.on("TYPING_START", () => {
            socket.broadcast.to(socketUser.roomId).emit("TYPING_START", {
                id: user.id
            });
        });
        socket.on("TYPING_END", () => {
            socket.broadcast.to(socketUser.roomId).emit("TYPING_END", {
                id: user.id
            });
        });

        socket.on("REQUEST_ROOM_DATA", async(data, db) => {
            const [dbRoom] = await globalObj.database.conn.query(`SELECT * FROM rooms WHERE id='${data.id}'`);
        });

        socket.on("REQUEST_USER_DATA", async(data, cb) => {
            const [dbUser] = await globalObj.database.conn.query(`SELECT * FROM users WHERE id='${data.id}'`);
            if (!dbUser) {
                return cb({
                    status: 404,
                    message: "User with that ID could not be found"
                });
            }

            cb({ status: 200, ...readyUserForClient(dbUser) })
        });

        socket.on("disconnect", () => {
            // console.log(`User confirmed ${user.name}#${user.discrim} dicsonnected`)
        });
    });

    const jsonifySqlUser = (sqlUser) => {
        if (sqlUser.rooms) {
            sqlUser.rooms = sqlUser.rooms.split(",");
        } else {
            sqlUser.rooms = [];
        }
        return sqlUser;
    }
    const readyUserForClient = (user) => {
        // extract password and email address
        const { password, email, ...readyUser } = user;
        return readyUser;
    }
}