const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
    name: String,
    category: String,
    capacity: Number,
    phone: String,
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    street_address: String,
    zipcode: String,
    current_pop: Number,
});

module.exports = mongoose.model("store", storeSchema);
