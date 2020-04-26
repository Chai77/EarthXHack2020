const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

module.exports = async (passport, getStoreByUsername, getStoreById) => {
    const isCorrect = async (username, password, done) => {
        const user = getStoreByUsername(username);
        console.log(user);
        if (user) {
            try {
                //const same = await bcrypt.compare(password, user.password);
                const same = password === user.password;
                console.log(password);
                console.log(same);
                if (same) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Auth failed" });
                }
            } catch (err) {
                return done(err);
            }
        } else {
            done(null, false, { message: "Auth failed" });
        }
    };

    passport.use(
        "local",
        new LocalStrategy(
            {
                usernameField: "storeUsername",
                passwordField: "password",
            },
            isCorrect
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        const user = getStoreById(id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
};
