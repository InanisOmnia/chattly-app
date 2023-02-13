module.exports.setup = async (globalObj) => {

    const path = require("path");

    const express = require("express");

    const flash = require("express-flash");
    const cookieParser = require("cookie-parser");
    const methodOverride = require("method-override");
    const cors = require("cors");
    const expressLayouts = require("express-ejs-layouts");
    const bodyParser = require("body-parser");
    const favicon = require('serve-favicon');

    const app = express();

    app.use(require("./middlewares/session.js"))
    app.use(cookieParser());

    const passport = require("passport");
    await require("./strategies/local")(passport,
        async (email, cb) => {
            const [user] = await globalObj.database.conn.query(`SELECT * FROM users WHERE email='${email}'`);
            cb(user);
        },
        async (id, cb) => {
            const [user] = await globalObj.database.conn.query(`SELECT * FROM users WHERE id='${id}'`);
            cb(user);
        },
    )

    app.use(passport.initialize());
    app.use(passport.session());

    app.set("views", path.join(__dirname, '/views'));
    app.set("view engine", "ejs");

// allows for changes in view folder to be used (without server restart)
// NOTE: comment out if site becomes actively used and it affects performance
    app.disable('view cache');

    app.use(express.urlencoded({extended: false}));
    app.use(flash());

    app.use(methodOverride("_method"));
    app.use(cors());
    app.use(expressLayouts);
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.json({limit: "1mb"}));
    app.use(express.static(path.join(__dirname, "public")));

    app.use(favicon(path.join(__dirname, "public", "images", 'favicon.png')))

// ## setup default global locals ## \\
// user (or undefined)
// all flash messages
    app.use((req, res, next) => {
        res.locals.user = req.user;
        res.locals.flashMsg = req.flash();
        next();
    });

    app.use((req, res, next) => {
        const method = req.method;
        const url = req.url;
        const status = res.statusCode;
        const log = `${method}:${url} ${status}`;
        // console.log(log)
        next();
    });

// Routing
    const router = require("./router");
    app.use("/", router(globalObj));

// ## Error Catching ## \\
    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500);
        if (res.locals.flashMsg.error) {
            res.locals.flashMsg.error.push(err.toString())
        } else {
            res.locals.flashMsg.error = [err.toString()]
        }
        res.render('error');
    });


    const port = 3000;
    const server = app.listen(port, () => {
        console.log(`Server listening at port ${port}`);
    });

    return {
        app,
        server
    }
}