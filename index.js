const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const dotenv = require("dotenv");
const homeRouter = require("./routes/home.js");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const initializePassport = require("./config/passport.js");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const favicon = require('serve-favicon');
const { checkAuthenticated, checkNotAuthenticated } = require("./middleware.js");

const stores = [];  //TODO: make this a real database

dotenv.config();
const app = express();
const server = http.Server(app);

app.use(favicon('favicon.ico'));

const io = socketio(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});
const ejsLayouts = require("express-ejs-layouts");
const ejs = require("ejs");

const PORT = process.env.PORT || 3309;

let sockets = [];
io.on("connection", (sock) => {
    console.log("There was a new connection");
    sock.emit("changed", stores);
    sockets.push(sock);
    sock.on('disconnect', () => {
        sockets = sockets.filter(socket => {
            return socket.id != sock.id;
        });
    });
});

app.set("view engine", ejs);
app.set("views", __dirname + "/views");
app.set("layout", __dirname + "/views/layout/layout.ejs");

app.use(ejsLayouts);

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.render("map.ejs", { website: req.protocol + "://" + req.hostname + ":" + PORT });
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
            const hashedPassword = await bcrypt.hash(password, 10);
            const newObject = {
                username,
                password: hashedPassword,
                _id: uuid.v4(),
            };
            stores.push(newObject);
            res.redirect("/change-user-count");
            sockets.forEach(socket => {
                socket.emit("changed", stores);
            });
        } catch (err) {
            res.render("register.ejs", {
                errorMessage: "User creation failed"
            });
        }
    }
});

app.get("/change-user-count", checkNotAuthenticated, (req, res) => {
    res.send("Change user count");
});

app.put("/change-user-count", checkNotAuthenticated, (req, res) => {
    sockets.forEach(socket => {
        socket.emit("changed", stores);
    })
    res.send("Change user count value PUT call");
});

server.listen(PORT, () => {
    console.log(`The app is listening on port ${PORT}`);
});
