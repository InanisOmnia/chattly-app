const cookiesEnabledElseCookiePolicy = require("./middlewares/cookiesEnabledElseCookiePolicy");
const isAuthenticatedElseLogin = require("./middlewares/isAuthenticatedElseLogin");

module.exports = (globalObj) => {
    const express = require('express');
    const router = express.Router();

    router.use("/", require("./routes")(globalObj));
    router.use("/auth", cookiesEnabledElseCookiePolicy, require("./routes/auth")(globalObj));
    router.use("/info", require("./routes/info")(globalObj));
    router.use("/app", isAuthenticatedElseLogin, require("./routes/app")(globalObj));

    router.get("*", (req, res) => {
        res.status(404).render("error");
    });

    return router;
};