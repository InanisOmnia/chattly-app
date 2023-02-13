const Snowflake = require("../structures/Snowflake");

module.exports = (globalObj) => {

    const express = require('express');
    const router = express.Router();

    router.get("/", (req, res) => {
        res.sendStatus(200).end();
    });

    const passport = require("passport");
    const bcrypt = require("bcrypt");

    const isAuthenticatedThenApp = require("../middlewares/isAuthenticatedThenApp");

    router.get("/login", isAuthenticatedThenApp, (req, res) => {
        res.render("login", {messages: res.locals.messages});
    });

    router.post("/login", isAuthenticatedThenApp, passport.authenticate("local", {
        successRedirect: "/app",
        failureRedirect: "/auth/login",
        failureFlash: true
    }));

    router.get("/register", isAuthenticatedThenApp, (req, res) => {
        res.render("register", {messages: res.locals.messages});
    });

    router.post("/register", isAuthenticatedThenApp, async (req, res) => {
        const emailexists = await globalObj.database.webUsers.count({email: req.body.email})
        if (emailexists) {
            req.flash("error", "User with that E-mail already exists");
            res.redirect("/auth/register");
            return;
        }
        const noNames = await globalObj.database.webUsers.count({name: req.body.name})
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        globalObj.database.webUsers.insert({
            name: req.body.name,
            discrim: noNames.toString().padStart(4, "0"),
            email: req.body.email,
            password: hashedPassword,
            id: Snowflake.generate()
        }).then(() => res.redirect("/auth/login"));
    });

    router.get("/logout", (req, res) => {
        req.logOut();
        res.redirect("/auth/login");
    });

    return router;
}