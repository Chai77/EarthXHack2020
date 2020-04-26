module.exports = {
    HOST: "us-cdbr-iron-east-01.cleardb.net",
    USER: "b36adf0be337e5",
    PASSWORD: "2476f012",
    DB: "heroku_246b02e345ebdc0",
    dialect: "mysql",
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};