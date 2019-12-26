'use strict';
const chalk = require('chalk');
const mongoose = require("mongoose");
const _ = require("lodash");

const log = console.log;

const documentationSchemas = new mongoose.Schema({
    technology : {
        type: String,
        required: true
    },
    topic : {
        type: String,
        required: true
    },
    selectedDocument : {}
}, {
    collection: 'Documentation',
    timestamp: true
});

// Responsible to return details in object form
documentationSchemas.methods.getDetails = function(){
    let documentObject = this.toObject();
    return _.omit(documentObject, '__v')
};

// Responsible to get technology document record
documentationSchemas.statics.getTechnologyDocument = function (technologyId, callback) {
    const query = {
        technology: technologyId
    };
    this.find(query, function (error, allTechnologyDocument) {
        if (error) {
            log(
                chalk.red(`An error occurred while remove technology hours`),
                error
            );
            return callback(error);
        }
        return callback(error, allTechnologyDocument);
    });
};

// Responsible for update technology document record
documentationSchemas.statics.updateDocument = function (documentObject, callback) {
    const {documentId, addDocument} = documentObject;
    const {technology, topic, selectedDocument} = addDocument;
    let id = {_id : documentId};
    let newValue = {technology, topic, selectedDocument};

    this.findById(id, (error, dataForUpdate) => {
        dataForUpdate.technology = newValue.technology;
        dataForUpdate.topic = newValue.topic;
        newValue.selectedDocument !== undefined ? (
                newValue.selectedDocument.hasOwnProperty('tutorialLink') ? dataForUpdate.selectedDocument = {...dataForUpdate.selectedDocument,tutorialLink : newValue.selectedDocument.tutorialLink} : '',
                newValue.selectedDocument.hasOwnProperty('documentLink') ? dataForUpdate.selectedDocument = {...dataForUpdate.selectedDocument,documentLink : newValue.selectedDocument.documentLink} :
                    dataForUpdate.selectedDocument = {...dataForUpdate.selectedDocument,documentLink : ''}
                )
                :
                false
        dataForUpdate.save((error,updatedDocument) => {
            if (error) {
                log(
                    chalk.red(`An error occured while update technology document`),
                    error
                );
                return callback(error);
            }
            let updatedDocumentMapped = updatedDocument.getDetails();
            return callback(null, updatedDocumentMapped);
        });
    });
};

// Responsible for delete technology document record
documentationSchemas.statics.deleteDocument = function (document_id, callback) {
    const query = {
        _id: document_id
    };
    this.deleteOne(query, (error, deletedDocument) => {
        if (error) {
            log(
                chalk.red(`An error occured while delete technology document`),
                error
            );
            return callback(error);
        }
        return callback(null, deletedDocument);
    });
};

// Responsible for delete topic wise technology document
documentationSchemas.statics.deleteDocumentTopicWise = function (topic_id, callback) {
    const query = {
        topic : topic_id
    };
    this.deleteMany(query, (error, deletedDocuments) => {
        if (error) {
            log(
                chalk.red(`An error occured while delete topic wise technology document`),
                error
            );
            return callback(error);
        }
        return callback(null, deletedDocuments);
    });
};

// Responsible to return pointed technology document
documentationSchemas.statics.getDocumentation = function (document_id, callback) {
    this.findById(document_id, (error, documentation) => {
        if (error) {
            log(
                chalk.red(`An error occured while get particular pointed document`),
                error
            );
            return callback(error);
        }
        return callback(null, documentation);
    });
};

// Responsible for count technology document
documentationSchemas.statics.CountTechnologyDocument = function (callback) {
    this.aggregate([{
        $group : {
            _id: "$technology",
            count: {
                $sum:1
            }
        }
    }], (error, countedDocument) => {
        if (error) {
            log(
                chalk.red(`An error occured while count technology document`),
                error
            );
            return callback(error);
        }
        return callback(null, countedDocument);
    });
};

// Responsible for count technology wise document
documentationSchemas.statics.getTechnoDocumentCount = function (selectedTechnology, callback) {
    this.aggregate([{$match:{technology:selectedTechnology}},
        {$group:{_id:"$technology",count: {$sum: 1}}}], (error, response) => {
        if (error) {
            log(
                chalk.red(`An error occured while count technology wise document`),
                error
            );
            return callback(error);
        }
        return callback(null, response);
    });
};

module.exports = mongoose.model('Documentation',documentationSchemas);