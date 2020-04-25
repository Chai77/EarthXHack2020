const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home.ejs");
});


router.get("/map", (req, res) => {
    res.render("map.ejs");
});

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.post("/login", (req, res) => {
    res.send("Login function");
});

router.get("/add-store", (req, res) => {
    res.render("register.ejs");
});

router.post("/add-store", (req, res) => {
    res.send("Add store function");
})

module.exports = router;