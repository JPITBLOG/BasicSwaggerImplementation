'use strict';
const mongoose = require("mongoose");
const _ = require("lodash");
const chalk = require('chalk');
const log = console.log;

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    collection: 'Admin',
    timestamp: true
});

// Responsible to return a record in an object form.
adminSchema.methods.getDetails = function () {
    let adminObject = this.toObject();
    return _.omit(adminObject, '__v');
};

// Responsible for verify required email exist in admin collection
adminSchema.statics.RegisterVerify = function (emailId, callback){
    this.countDocuments({emailId}, (error, isRecordExist) => {
       if (error) {
           log(
             chalk.red(`An error occurred while checking the existence of given email ${emailId}`),
             error
           );
           return callback(error);
       }
       return callback(null, !!isRecordExist);
    });
};

// Responsible for verify the data has been exist for given record
adminSchema.statics.LoginVerify = function (loginData,callback) {
    const query = {
        'emailId':loginData.emailId,
        'password':loginData.password
    };
    this.findOne(query, (error, adminRecord) => {
       if (error) {
           log(
               chalk.red(`An error occurred while checking the existence of given email ${emailId}`),
               error
           );
           return callback(error);
       }
       return callback(null, adminRecord);
    });
};

module.exports = mongoose.model('Admin', adminSchema);