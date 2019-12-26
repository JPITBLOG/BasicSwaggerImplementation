'use strict';
const chalk = require('chalk');
const mongoose = require("mongoose");
const _ = require("lodash");

const log = console.log;

const trainyDocumentSchema = new mongoose.Schema({
    traineeId : {
        type: String,
        required: true
    },
    technology : {
        type: String,
        required: true
    },
    topic : {
        type: String,
        required: true
    },
    documentation : {
        type: String,
        required: true
    },
    markAsRead : {
        type: Boolean,
        required: true
    }
},{
    collection: 'traineeDocumentation',
    timestamp: true
});

// Responsible for update trainee document as read or unread
trainyDocumentSchema.statics.isAvailableDocument = function(traineeReadableDocument, callback){
    const {traineeId, documentation, markAsRead} = traineeReadableDocument;
    const query = {
                    traineeId,
                    documentation
    };

    this.findOne(query, (error, traineeDocument) => {
        if (error) {
            log(
                chalk.red(`An error occured while find trainy document from traineeDocumentation collection`),
                error
            );
            return callback(error);
        }
        else if (!traineeDocument) {
            return callback(true);
        }

        traineeDocument.markAsRead = markAsRead;
        traineeDocument.save((error, updatedTraineeDocument) => {
            if (error) {
                log(
                    chalk.red(`An error while insert updated trainee document`),
                    error
                );
                return callback(error);
            }
            return callback(null, updatedTraineeDocument);
        });
    });
};

// Responsible to return particular readable document of trainee
trainyDocumentSchema.statics.getTraineeMarkedDocument = function(dataForCheckMarked, callback){
    const {documentation,trainyId} = dataForCheckMarked;
    const query = {
        trainyId,
        documentation,
        markAsRead:true
    };
    this.findOne(query, (error, traineeReadableDocument) => {
        if (error) {
            log(
                chalk.red(`An error occured while find trainee readable document`),
                error
            );
            return callback(error);
        }
        return callback(null, traineeReadableDocument);
    });
};

// Responsible to return all document of trainee
trainyDocumentSchema.statics.getAllDocumentOfTrainee = function (trainyId, callback) {
    this.find({trainyId}, (error, traineeDocument) => {
        if (error) {
            log(
                chalk.red(`An error occured while get All Document of trainee`),
                error
            );
            return callback(error);
        }
        return callback(null, traineeDocument);
    });
};

// Responsible for count document based on technology
trainyDocumentSchema.statics.countDocumentByTechnology = function (trainyId, technology, callback) {
    const query = {
                    trainyId,
                    technology,
                    markAsRead:true
    };
    this.countDocuments(query, (error, documentCounted) => {
        if (error) {
            log(
                chalk.red(`An error occured while count document based on technology`),
                error
            );
            return callback(error);
        }
        return callback(null, documentCounted);
    });
};

module.exports = mongoose.model('traineeDocumentation',trainyDocumentSchema);