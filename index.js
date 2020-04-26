const express = require("express");
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
const db = require("./config/db.conn.js");
const Sequelize = require("sequelize");
let numUsers;
const {
    checkAuthenticated,
    checkNotAuthenticated,
} = require("./middleware.js");

const stores = []; //sameTODO: make this a real database

dotenv.config();
const app = express();
// const server = http(app);
// const io = socketio(server);

app.use(favicon("favicon.ico"));

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

const findByUsername = async (
    username,
    second = false,
    storeInfo = null,
    res = null
) => {
    const UID = username.trim().toLowerCase();

    try {
        const info = await db.storeInfo.findAll({});
        console.log(info);
        numUsers = info.length;
        const arrResult = info.find((store) => {
            return store.username == UID;
        });
        if (arrResult) {
            if (second) {
                continueCreation(arrResult[0], storeInfo, res);
            }
            return arrResult;
        } else {
            if (second) {
                continueCreation(false, storeInfo, res);
            }
            return false;
        }
    } catch {
        if (second) {
            continueCreation(false, storeInfo, res);
        }
        return false;
    }
};

initializePassport(passport, findByUsername, async (id) => {
    try {
        const data = await db.storeInfo.findByPk(id);
        return data;
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

app.get("/add-store", checkAuthenticated, (req, res) => {
    res.render("register.ejs", { errorMessage: "" });
});

const continueCreation = (otherUsernames, storeInfo, res) => {
    if (otherUsernames) {
        console.log(otherUsernames);
        res.render("register.ejs", { errorMessage: "Username is taken" });
    } else {
        try {
            storeInfo.store_id = numUsers + 1;
            // stores.push(newObject);
            db.storeInfo
                .create(storeInfo)
                .then((data) => {
                    console.log(data);
                    res.redirect("/change-user-count");
                })
                .catch((err) => {
                    console.log(err);
                    res.render("register.ejs", {
                        errorMessage: "Error creating account",
                    });
                });
        } catch (err) {
            res.render("register.ejs", {
                errorMessage: "User creation failed",
            });
        }
    }
};

// app.get("/delete-all", (req, res) => {
//     db.storeInfo
//         .destroy({
//             where: {},
//             truncate: true,
//         })
//         .then((data) => {
//             console.log("Deleted everything");
//         });
// });

app.post("/add-store", checkAuthenticated, async (req, res) => {
    //Add the store to the list
    const {
        username,
        password,
        address,
        zipcode,
        phone_number,
        capacity,
        category,
        storeName,
    } = req.body;
    if (
        username == "" ||
        password == "" ||
        address == "" ||
        zipcode == "" ||
        phone_number == "" ||
        capacity == ""
    ) {
        return res.render("register.ejs", {
            errorMessage: "Must fill out all of the spaces",
        });
    }
    const storeInfo = {
        store_id: numUsers + 1,
        username: username.trim().toLowerCase(),
        password,
        street_address: address,
        current_pop: 0,
        zipcode,
        phone: phone_number,
        capacity: parseInt(capacity),
        name: storeName,
        category,
    };
    findByUsername(username, true, storeInfo, res);
});

app.get("/change-user-count", checkNotAuthenticated, (req, res) => {
    res.render("change.ejs", {
        errorMessage: "",
        numberOfPeople: req.user.current_pop,
    });
});

app.post("/change-user-count-add", checkNotAuthenticated, async (req, res) => {
    let newVal = req.user.current_pop + 1;

    const storeInfo = {
        ...req.user,
        current_pop: newVal,
    };

    try {
        const res = await db.storeInfo.update(storeInfo, {
            where: { store_id: req.user.store_id },
        });
        res.render("change.ejs", {
            numberOfPeople: storeInfo.current_pop,
            errorMessage: "",
        });
    } catch (err) {
        res.render("change.ejs", {
            numberOfPeople: req.user.current_pop,
            errorMessage: "The database was not updated",
        });
    }
});

app.post("/change-user-count-subtract", checkNotAuthenticated, async (req, res) => {

    let newVal = req.user.current_pop -1;
    if (newVal < 0) {
        newVal = 0;
    }

    const storeInfo = {
        ...req.user,
        current_pop: newVal,
    };

    try {
        const res = await db.storeInfo.update(storeInfo, {
            where: { store_id: req.user.store_id },
        });
        res.render("change.ejs", {
            numberOfPeople: storeInfo.current_pop,
            errorMessage: "",
        });
    } catch (err) {
        res.render("change.ejs", {
            numberOfPeople: req.user.current_pop,
            errorMessage: "The database was not updated",
        });
    }
});

app.get("/api/stores", (req, res) => {
    db.storeInfo
        .findAll({})
        .then((data) => {
            console.log(data);
            res.send(JSON.stringify(data));
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    "Some error occurred while retrieving Store Info.",
            });
        });

    // console.log("Hello World");
    // res.send(JSON.stringify(stores));
});

app.post("/logout", checkNotAuthenticated, (req, res) => {
    req.logOut();
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`The app is listening on port ${PORT}`);
});
//DELETE * stores where stores_id = id
