const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/change-user-count");
    }
    next();
};

const checkNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
};

module.exports.checkAuthenticated = checkAuthenticated;
module.exports.checkNotAuthenticated = checkNotAuthenticated;