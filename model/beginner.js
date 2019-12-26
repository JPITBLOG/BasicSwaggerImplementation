'use strict';
const mongoose = require("mongoose");
const chalk = require('chalk');
const log = console.log;
const _ = require("lodash");

const beginnerSchema = new mongoose.Schema({
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
    },
    time : { type : Date, default: new Date() },
    technoHours : Object
}, {
    collection: 'Beginner',
    timestamp: true
});

//Responsible to return a details
beginnerSchema.methods.getDetails = function () {
    let beginnerObject = this.toObject();
    return _.omit(beginnerObject, '__v');
};

// Responsible for verify required email exist in beginner collection
beginnerSchema.statics.RegisterVerify = function (emailId, callback) {
    this.countDocuments({emailId}, (error, isRecordExist) => {
        if(error){
            log(
                chalk.red(`An error occurred while checking the existence of given email ${emailId}`),
                error
            );
            return callback(error);
        }
        return callback(null, !!isRecordExist);
    });
};

// Responsible for login verification
beginnerSchema.statics.LoginVerify = function (loginData, callback) {
    const query = {
        'emailId':loginData.emailId,
        'password':loginData.password
    };
    this.findOne(query, (error, beginnerRecord) => {
        if(error) {
            log(
                chalk.red(`An error occurred while login for email ${query.emailId}`),
                error
            );
            return callback(error);
        }
        return callback(null, beginnerRecord);
    });
};

// Responsible to return all the Trainees
beginnerSchema.statics.getAllTrainee = function (query, callback) {
    this.find(query, (error, allTrainee) => {
        if(error){
            log(
                chalk.red(`An error occurred while getting all beginner records`),
                error
            );
            return callback(error);
        }
        return callback(null, allTrainee);
    });
};

// Responsible to add and return a records
beginnerSchema.statics.upsertTechnoHours = function (technoHoursObj, callback) {
    const {_id, technologyName, technologyHours} = technoHoursObj;
    this.findOne({_id}, (error, pointedIdData) => {
        if (error) {
            log(
                chalk.red(`An error occurred while get and add technology hours`),
                error
            );
            return callback(error);
        }
        pointedIdData.technoHours = {...pointedIdData.technoHours, [technologyName] : technologyHours};
        pointedIdData.save((error, technologyHours) => {
            if (error) {
                log(
                    chalk.red(`An error occurred while save and get technology hours`),
                    error
                );
                return callback(error);
            }
            return callback(null, technologyHours.technoHours);
        });
    });
};

// Responsible to remove the techno hours
beginnerSchema.statics.removeTechnoHours = function (_id, removeTechnoHour, callback) {
    this.findOne({_id}, (error, pointedIdData) => {
        if(error){
            log(
                chalk.red(`An error occurred while remove technology hours`),
                error
            );
            return callback(error);
        }
        if (pointedIdData) {
            let {technoHours} = pointedIdData.toObject();
            delete technoHours[removeTechnoHour];
            pointedIdData.technoHours = technoHours;
            pointedIdData.save((error, technologyObject) => {
                if (error) {
                    log(
                        chalk.red(`An error occurred while update the beginner record after remove the technology hours`),
                        error
                    );
                    return callback(error);
                }
                return callback(null, technologyObject.technoHours);
            });
        }
        else return callback(null);
    });
};

module.exports = mongoose.model('Beginner',beginnerSchema);