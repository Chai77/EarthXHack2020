//[STEP-3] File Name: Create "storesinfo.js" under "models" folder 
module.exports = (sequelize, Sequelize) => {
    const StoresInfo = sequelize.define("storesinfo", {
        store_id: {
            type: Sequelize.INT
        },
        name: {
            type: Sequelize.STRING
        },
        category: {
            type: Sequelize.STRING
        }
  
      capacity: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        }
      latitude: {
            type: Sequelize.STRING
        },
        longtitude: {
            type: Sequelize.STRING
        }
  
      zipcode: {
            type: Sequelize.STRING
        },
        start_time: {
            type: Sequelize.STRING
        }
      end_time: {
            type: Sequelize.STRING
        },
        open_monday: {
            type: Sequelize.STRING
        }
  
      open_tuesday: {
            type: Sequelize.STRING
        },
        open_wednesday: {
            type: Sequelize.STRING
        }
      open_thursday: {
            type: Sequelize.STRING
        },
        open_friday: {
            type: Sequelize.STRING
        }  
  
      open_saturday: {
            type: Sequelize.STRING
        },
        open_sunday: {
            type: Sequelize.STRING
        }
      current_pop: {
            type: Sequelize.STRING
        },
        username: {
            type: Sequelize.STRING
        }
      password: {
            type: Sequelize.STRING
        }
      street_address: {
            type: Sequelize.STRING
        }
  
    return storesinfo;
    };
