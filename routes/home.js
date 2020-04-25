const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home.html");
});


router.get("/map", (req, res) => {
    res.render("map.html");
});

router.get("/login", (req, res) => {
    res.render("home.html");
});