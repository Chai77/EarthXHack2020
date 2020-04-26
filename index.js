const express = require("express");
const dotenv = require("dotenv");
const homeRouter = require("./routes/home.js");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const initializePassport = require("./config/passport.js");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const {checkAuthenticated, checkNotAuthenticated} = require("./middleware.js");

dotenv.config();
const app = express();
const ejsLayouts = require("express-ejs-layouts");
const ejs = require("ejs");

const PORT = process.env.PORT || 3309;

app.set("view engine", ejs);
app.set("views", __dirname + "/views");
app.set("layout", __dirname + "/views/layout/layout.ejs");

app.use(ejsLayouts);

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const stores = [];

initializePassport(passport, (username) => {
    return stores.find((store) => {
        return store.username === username.trim().toLowerCase();
    });
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
    res.render("map.ejs");
});

app.get("/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs");
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

app.post("/add-store", checkAuthenticated, async (req, res) => {
    //Add the store to the list
    const { username, password } = req.body;
    const otherUsernames = stores.find((store) => {
        return store.username === username;
    });
    if (otherUsernames && otherUsernames.length > 0) {
        console.log(otherUsernames);
        res.render("register.ejs", { errorMessage: "Username is taken" });
    } else {
        try {
            console.log("Hello World");
            const hashedPassword = await bcrypt.hash(password, 10);
            const newObject = {
                username,
                password: hashedPassword,
                _id: uuid.v4(),
            };
            stores.push(newObject);
            res.redirect("/change-user-count");
        } catch (err) {
            res.render("register.ejs", {
                errorMessage: "User creation failed",
            });
        }
    }
});

app.get("/change-user-count", checkNotAuthenticated, (req, res) => {
    res.send("Change user count");
});

app.put("/change-user-count", checkNotAuthenticated, (req, res) => {
    res.send("Change user count value PUT call");
});

app.listen(PORT, () => {
    console.log(`The app is listening on port ${PORT}`);
});
