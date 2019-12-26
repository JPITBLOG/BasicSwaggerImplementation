'use strict';
const chalk = require('chalk');
const mongoose = require("mongoose");
const _ = require("lodash");

const log = console.log;

const technologySchema = new mongoose.Schema({
    technology : {
        type: String,
        required: true
    },
    hours : {
        type: Number,
        required: true
    }
},{
    collection: 'Technology',
    timestamp: true
});
// Responsible to return a record in object form.
technologySchema.methods.getDetails = function () {
    let allTechnologyObject = this.toObject();
    return _.omit(allTechnologyObject,'__v');
};

// Responsible to verify technology is available or not
technologySchema.statics.technologyVerify = function (technology, callback) {
    this.countDocuments({technology}, (error, technologyCounted) => {
        if (error) {
            log(
                chalk.red(`An error occured while verify technology is available`),
                error
            );
            return callback(error);
        }
        return callback(null, technologyCounted);
    });
};

// Responsible to return all technology from technology collection
technologySchema.statics.getAllTechnology = function (callback) {
    this.find((error, getAllTechnology) => {
       if (error) {
           log(
               chalk.red(`An error occured while get All technology`),
               error
           );
           return callback(error);
       }
       return callback(null, getAllTechnology);
    });
};

// Responsible for delete particular technology from technology collection
technologySchema.statics.deleteTechnology = function (_id, callback) {
    this.deleteOne({_id}, (error, deleteStatus) => {
        if (error) {
            log(
                chalk.red(`An error occured while delete technology`),
                error
            );
            return callback(error);
        }
        return callback(null, deleteStatus.deletedCount === 1 ? true : false);
    });
};

// Responsible to return technology name from technology collection
    technologySchema.statics.findTechnologyName = function (_id, callback) {
    const select = {
        technology : 1
    };
    this.findById(_id, select, (error, TechnologyName) => {
        if (error) {
            log(
                chalk.red(`An error occured while find technology name based on Id`),
                error
            );
            return callback(error);
        }
        return callback(null, TechnologyName);
    });
};



module.exports = mongoose.model('Technology',technologySchema);
