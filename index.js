const express = require('express');
const dotenv = require("dotenv");
const homeRouter = require("./routes/home.js");

dotenv.config();
const app = express();
const ejsLayouts = require("express-ejs-layouts");
const ejs = require("ejs");

const PORT = process.env.PORT || 3309;

app.set("view engine", ejs);
app.set("view", __dirname + "/views");
app.set("layout", __dirname + "/views/layout/layout.ejs");
app.use(ejsLayouts);

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(homeRouter);

app.listen(PORT, () => {
    console.log(`The app is listening on port ${PORT}`);
});