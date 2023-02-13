const session = require("cookie-session");

module.exports = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    keys: ["key0"],
    cookie: {maxAge: 172800000} // 172800000: two days
});