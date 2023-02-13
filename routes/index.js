module.exports = (globalObj) => {
    const express = require('express');
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("index");
    });

    return router;
}