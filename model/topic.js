'use strict';
const chalk = require('chalk');
const mongoose = require("mongoose");
const _ = require("lodash");

const log = console.log;

const topicSchema = new mongoose.Schema({
    technology : {
        type: String,
        required: true
    },
    topic : {
        type: String,
        required: true
    }
},{
    collection: 'Topic',
    timestamp: true
});

// Responsible to return a record in an object form.
topicSchema.methods.getDetails = function () {
    let allTopicObject = this.toObject();
    return _.omit(allTopicObject,'__v');
}

// Responsible for verify required topic exist in topic collection
topicSchema.statics.topicVerify = function (topic, callback) {
    this.countDocuments({topic}, (error, topicCounted) => {
        if (error) {
            log(
                chalk.red(`An error occured while verify topic in topic collection`),
                error
            );
            return callback(error);
        }
        return callback(null, topicCounted);
    });
};

// Responsible to return all topic from topic collection
topicSchema.statics.getAllTopic = function (callback) {
    this.aggregate([
        { $group : { _id : "$technology", topic: { $push: "$$ROOT"}}},
        { $project: { 'topic': 1, '_id': 1 } }
    ], (error, response) => {
        if (error) {
            log(
                chalk.red(`An error occured while return all topic`),
                error
            );
            return callback(error);
        }
        let allTopic = [];
        response.forEach((res) => allTopic = allTopic.concat(res.topic));
        if (!allTopic.length) {
            log(
                chalk.red(`There is no any topic available`)
            );
            return callback(`There is no any topic available`);
        }
        return callback(null, allTopic);
    });
};

// Responsible to return topic name from topic collection
topicSchema.statics.findTopicName = function (topicName, callback) {
    const query = {
        _id: topicName
    };
    const selectField = {
        topic:1
    };

    this.findOne(query, selectField, (error, topicName) => {
        if (error) {
            log(
                chalk.red(`An error occured while find topic name`),
                error
            );
            return callback(error);
        }
        console.log("topic name is: "+topicName);
        return callback(null, topicName.topic);
    });
};

// Responsible for delete topic from topic collection
topicSchema.statics.deleteTopic = function (_id, callback) {
    this.deleteOne({_id}, (error, deleted) => {
        if (error) {
            log(
                chalk.red(`An error occured while delete particular topic from topic collection`),
                error
            );
            return callback(error);
        }
        if(deleted.deletedCount === 1)
            return callback(null, true);
    });
};

module.exports = mongoose.model('Topic',topicSchema);