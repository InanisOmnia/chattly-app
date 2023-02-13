module.exports = (globalObj) => {
    const express = require('express');
    const router = express.Router();

    router.get("/about", (req, res) => {
        res.render("about");
    });
    router.get("/contact", (req, res) => {
        res.render("contact");
    });
    router.get("/changelog", (req, res) => {
        res.render("changelog");
    });
    router.get("/cookies", (req, res) => {
        res.render("cookies");
    });
    router.get("/dataprivacy", (req, res) => {
        res.render("dataprivacy");
    });
    router.get("/acknowledgements", (req, res) => {
        res.render("acknowledgements");
    });
    router.get("/premium", (req, res) => {
        res.render("premium");
    });

    return router;
}