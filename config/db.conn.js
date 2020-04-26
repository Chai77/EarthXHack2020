const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
}, );

const dbEarthXHack2020 = {};

dbEarthXHack2020.Sequelize = Sequelize;
dbEarthXHack2020.sequelize = sequelize;

dbEarthXHack2020.storeInfo = require("../models/storesinfo.js")(sequelize, Sequelize);
module.exports = dbEarthXHack2020;