module.exports = (req, res, next) => {
    if(!parseInt(req.cookies.acceptCookies)){
        req.flash("error", "You must have accepted cookies to use this feature");
        res.redirect("/info/cookies");
        return;
    }
    next();
}