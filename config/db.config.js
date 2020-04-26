module.exports = {
    HOST: "192.168.0.10:3306",
    USER: "earthx",
    PASSWORD: "pa##w0rd",
    DB: "EarthXHack2020",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};