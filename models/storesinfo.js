//[STEP-3] File Name: Create "storesinfo.js" under "models" folder 
module.exports = (sequelize, Sequelize) => {
    const StoresInfo = sequelize.define("stores", {
       // (`store_id`, `name`, `category`, `capacity`, `phone`, `current_pop`, `username`, `password`, `street_address`, `zipcode`)
        //             varchar, varchar,    int,        vachar,     int,          varchar,     varchar,    varchar,        varchar
        store_id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
          },
        name: {
            type: Sequelize.STRING
        },
        category: {
            type: Sequelize.STRING
        },
        capacity: {
            type: Sequelize.INTEGER
        },
        phone: {
            type: Sequelize.STRING
        },
        current_pop: {
            type: Sequelize.INTEGER
        },
        username: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        street_address: {
            type: Sequelize.STRING
        },
        zipcode: {
            type: Sequelize.STRING
        },
    }, {
        timestamps: false
    });
    return StoresInfo;
}
