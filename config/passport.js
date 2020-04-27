const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

module.exports = async (passport, getStoreByUsername, getStoreById) => {
    const isCorrect = async (username, password, done) => {
        console.log("IS CALLED");
        try {
            const user = await getStoreByUsername(username);
            if (user) {
                //const same = await bcrypt.compare(password, user.password);
                const same = password === user.password;
                if (same) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Auth failed" });
                }
            } else {
                done(null, false, { message: "Auth failed" });
            }
        } catch (err) {
            done(err);
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
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await getStoreById(id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            done(err);
        }
    });
};

//
//DATABASE_URL=mongodb://127.0.0.1:27017/myapp
