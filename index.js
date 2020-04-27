const express = require("express");
const mongoose = require("mongoose");
// const http = require("http");
// const socketio = require("socket.io");
const dotenv = require("dotenv");
const homeRouter = require("./routes/home.js");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const initializePassport = require("./config/passport.js");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const favicon = require("serve-favicon");
const methodOverride = require("method-override");
const cors = require("cors");
const Store = require("./models/Store");
const url = require("url");

const {
    checkAuthenticated,
    checkNotAuthenticated,
} = require("./middleware.js");

dotenv.config();
const app = express();
// const server = http(app);
// const io = socketio(server);

app.use(favicon("favicon.ico"));

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

mongoose.connection.on("error", (err) => {
    console.log("There was an error connecting to mongoose", err);
});

mongoose.connection.once("open", () => {
    console.log("Mongoose connected successfully");
});

const ejsLayouts = require("express-ejs-layouts");
const ejs = require("ejs");

const PORT = process.env.PORT || 3309;

// let sockets = [];
// io.on("connection", (sock) => {
//     console.log("There was a new connection");
//     sock.emit("changed", stores);
//     sockets.push(sock);
//     sock.on('disconnect', () => {
//         sockets = sockets.filter(socket => {
//             return socket.id != sock.id;
//         });
//     });
// });

app.set("view engine", ejs);
app.set("views", __dirname + "/views");
app.set("layout", __dirname + "/views/layout/layout.ejs");

app.use(ejsLayouts);
app.use(cors());
app.use(methodOverride("_method"));

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const findByUsername = async (username) => {
    //Add the ability to find one object in the database with the same url
    try {
        const store = Store.findOne({ username: username });
        return store;
    } catch {
        return false;
    }
};

initializePassport(passport, findByUsername, async (id) => {
    try {
        //find a store given its id
        const store = Store.findOne({ _id: id });
        return store;
    } catch {
        return false;
    }
});

app.use(cookieParser());
app.use(
    session({
        secret: process.env.SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

//app.use(homeRouter);

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/map", (req, res) => {
    res.render("map.ejs", {
        website: req.protocol + "://" + req.hostname + ":" + PORT,
    });
});

app.get("/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs", { message: "" });
});

app.post(
    "/login",
    checkAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/change-user-count",
        failureRedirect: "/login",
        failureFlash: false,
    })
);

app.get("/change-user-count", checkNotAuthenticated, async (req, res) => {
    let currentUser;
    try {
        currentUser = await req.user;
        res.render("change.ejs", {
            errorMessage: req.query.errorMessage ? req.query.errorMessage : "",
            numberOfPeople: currentUser.current_pop,
        });
    } catch (err) {
        res.render("change.ejs", {
            errorMessage: "The data could not be accessed",
            numberOfPeople: 0,
        });
    }
});

app.post("/add-store", checkAuthenticated, async (req, res, next) => {
    //Register method: create a new account
    console.log("The method was called");

    const {
        username,
        password,
        address,
        zipcode,
        storeName,
        category,
        phone_number,
        capacity,
    } = req.body;

    console.log(req.body);

    let user = 0;

    try {
        user = await Store.findOne({ username });
        //console.log(user);
        if (user !== null) {
            console.log("Username is taken so pick another one");
            return res.redirect("/login");
        }
        const newStore = new Store({
            name: storeName,
            category,
            capacity,
            phone: phone_number,
            username,
            password,
            street_address: address,
            zipcode,
            current_pop: 0,
        });
        await newStore.save();
        req.logIn(newStore, (err) => {
            if (err) {
                return res.redirect("/login");
            } else {
                return res.redirect("/change-user-count");
            }
        });
    } catch {
        console.log("The saving of the database object didn't work");
        res.redirect("/login");
    }
});
app.post("/change-user-count-add", checkNotAuthenticated, async (req, res) => {
    let currentUser;
    try {
        currentUser = await req.user;
        const user = await Store.findOne({ _id: currentUser._id });
        user.current_pop = user.current_pop + 1;
        await user.save();
        res.redirect(
            url.format({
                pathname: "/change-user-count",
            })
        );
    } catch (err) {
        console.log("The database was not updated", err);
        res.redirect(
            url.format({
                pathname: "/change-user-count",
                query: {
                    errorMessage: "The database was not updated",
                },
            })
        );
    }
});

app.post(
    "/change-user-count-subtract",
    checkNotAuthenticated,
    async (req, res) => {
        let currentUser;
        try {
            currentUser = await req.user;
            const user = await Store.findOne({ _id: currentUser.id });
            user.current_pop = user.current_pop - 1;
            await user.save();
            res.redirect(
                url.format({
                    pathname: "/change-user-count",
                })
            );
        } catch (err) {
            console.log("The database was not updated", err);
            res.redirect(
                url.format({
                    pathname: "/change-user-count",
                    query: {
                        errorMessage: "The database was not updated",
                    },
                })
            );
        }
    }
);

app.post("/api/delete-everything", async (req, res) => {
    try {
        const users = await Store.find({});
        let counter = 0;
        for (let i = users.length - 1; i >= 0; i--) {
            await users[i].remove();
            counter++;
            if (counter == user.length) {
                res.json({
                    message: "The request was successful",
                });
            }
        }
        if (users.length === 0) {
            res.json({
                message: "The database was already empty",
            });
        }
    } catch (err) {
        res.json({
            message: "The request was unsuccessful",
        });
    }
});

app.post("/api/delete/:id", async (req, res) => {
    try {
        console.log(req.params.id);
        const store = await Store.findOne({ _id: req.params.id });
        console.log(store);
        if (store === null || !store.id) {
            res.json({
                message: "There is no store with that id",
            });
        } else {
            await store.remove();
            res.json({
                message: "The store was successfully removed",
            });
        }
    } catch (err) {
        res.json({
            message: "There was an error and the store could not be removed",
            error: err,
        });
    }
});

app.get("/api/stores", async (req, res) => {
    try {
        const result = await Store.find({});
        res.send(JSON.stringify(result));
    } catch (err) {
        res.json({
            message: "There was an error fetching the data",
        });
    }
});

app.post("/logout", checkNotAuthenticated, (req, res) => {
    req.logOut();
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`The app is listening on port ${PORT}`);
});
//DELETE * stores where stores_id = id

/*

        passport.authenticate("local", (err, user, info) => {
            console.log(err, user, info);
            if (err) {
                console.log(err);
                return res.redirect("/login");
            }
            if (!user) {
                return res.redirect("/login");
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.log("There was an error signing in", err);
                    return res.redirect("/login");
                }
                return res.redirect("/change-user-count");
            });
        })(req, res, next);

*/
