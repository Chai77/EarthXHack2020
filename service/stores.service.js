const db = require("../models"); //*check with Harsha
const StoresInfo = db.storesinfo;
const Op = db.Sequelize.Op;

//[STEP-4 A]// Add Features: Create and Save a new StoresInfo 
exports.create = (req, res) => {
    // Validate request for Store ID
    if (!req.body.store_id) {
        res.status(400).send({
            message: "Store ID cannot be empty!"
        });
        return;
    }

    // Validate request for Store Name
    if (!req.body.name) {
        res.status(400).send({
            message: "Store Name cannot be empty!"
        });
        return;
    }

    // Validate request for Store Address
    if (!req.body.street_address) {
        res.status(400).send({
            message: "Store Address cannot be empty!"
        });
        return;
    }

    // Validate request for Store Zipcode
    if (!req.body.zipcode) {
        res.status(400).send({
            message: "Store Zipcode cannot be empty!"
        });
        return;
    }

    // Create a StoresInfo
    const storeInfo = {
        store_id: req.body.store_id,
        name: req.body.name,
        category: req.body.category ? req.body.category : false,
        capacity: req.body.capacity,
        phone: req.body.phone,
        zipcode: req.body.zipcode,
        current_pop: req.body.current_pop,
        username: req.body.username,
        password: req.body.password,
        street_address: req.body.street_address
    };

    // Save StoresInfo in the database
    StoresInfo.create(storeInfo)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the StoresInfo."
            });
        });
};


//[STEP-4 B] Add Features: Retrieve All StoresInfo objects (with condition)
exports.findAll = (req, res) => {
    const store_id = req.query.store_id;
    var condition = store_id ? { store_id: { [Op.like]: `%${store_id}%` } } : null;

    StoresInfo.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Store Info."
            });
        });
};

//[STEP-4 C] Add Features: Retrieve a single StoresInfo object
exports.findOne = (req, res) => {
    const store_id = req.params.store_id;

    StoresInfo.findByPk(store_id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Store Info with store_id=" + store_id
            });
        });
};

//[STEP-4 D] Add Features: Update StoresInfo object
exports.update = (req, res) => {
    const store_id = req.params.store_id;

    StoresInfo.update(req.body, {
        where: { store_id: store_id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Store Info was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Store Info with store_id=${store_id}. Maybe Store Info was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Store Info with store_id=" + store_id
            });
        });
};


//[STEP-4 E] Add Features: Delete StoresInfo object
exports.delete = (req, res) => {
    const store_id = req.params.store_id;

    StoresInfo.destroy({
        where: { store_id: store_id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "StoresInfo was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete StoresInfo with id=${id}. Maybe StoresInfo was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete StoresInfo with id=" + id
            });
        });
};


//[STEP-4 F] Add Features: Delete All StoresInfo objects
exports.deleteAll = (req, res) => {
    StoresInfo.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} StoresInfo were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all Store Info."
            });
        });
};


//[STEP-4 F] Add Features: Find all objects by condition
exports.findAllPublished = (req, res) => {
    StoresInfo.findAll({ where: { name: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Store Info."
            });
        });
};