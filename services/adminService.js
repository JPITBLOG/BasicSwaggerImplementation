'use strict';

//import jason-web-token
const jwt = require("jsonwebtoken");
//import
const fs = require("fs");
//import multer for upload image
const multer = require("multer");
//import AdminSchemas
const {AdminModel, TechnologyModel, TopicModel, DocumentationModel} = require('../model/index');
const access = 'auth';

let errorLog = {
    code: "DATA_NOT_EXIST",
    message: "Invalid Credentials"
};

var storage =   multer.diskStorage({
    destination: function (req, files, callback) {
        callback(null, '../upload/video');
    },
    filename: function (req, files, callback) {
        callback(null, files.originalname + '-' + Date.now());
    }
});

var upload = multer({ storage : storage}).single('selectedDocument');

class AdminService {
    constructor() {
    };

    createAdminService(swaggerParam, res, next) {
        let payload = swaggerParam.registerPayload.value;
        let adminModel = new AdminModel(payload);
        console.log("register payload: "+JSON.stringify(payload));
        _checkvalidation(payload.emailId, (err, response) => {
            if(err) {
                 return next(err);
            }
            res.setHeader('content-type', 'application/json');
            if (response) {
                errorLog.code = "DATA_EXIST";
                errorLog.message = "admin already available";
                return res.status(400).send(errorLog);
            }
            adminModel.save((err, response) => {
                if(err) {
                    return next(err);
                }
                console.log('POST call for admin register has been successfully completed');
                return res.status(201).send(response);
            });

        });
    };

    adminLoginService(swaggerParam, res, next) {
        let payload = swaggerParam.loginPayload.value;
        let query = {
            emailId: payload.emailId,
            password: payload.password
        };
        res.setHeader('content-type', 'application/json');
        AdminModel.findOne(query, (error, adminRecord) => {
            if (error) {
                errorLog.code = "RUNTIME_ERROR";
                errorLog.message = "An error occured while verify requested email & password";
                return res.status(400).send(error);
            }
            if(adminRecord) {
                let token = jwt.sign({_id:adminRecord._id,access,name:adminRecord.name},'sign123').toString();
                let adminObject = {
                    ...adminRecord.toJSON(),token
                };
                return res.status(200).send(adminObject);
            }
            else {
                errorLog.code = "DATA_NOT_EXIST";
                errorLog.message = "There is no any data ordered by you"
                return res.status(404).send(errorLog);
            }
        });
    };

    addTechnologyService(swaggerParam, res, next) {
        let payload = swaggerParam.technologyPayload.value;

        let addTechnologyObject = new TechnologyModel({
            technology : payload.technology,
            hours : payload.hours
        });

        _technologyVerify(addTechnologyObject.technology,(error,technologyCount) => {
            res.setHeader('content-type', 'application/json');
            if(!technologyCount){
                addTechnologyObject.save((err, response) => {
                    if(err)
                        return next(err);
                    console.log("techno response: "+JSON.stringify(response));
                    return res.status(201).send(response);
                });
            }
            else {
                errorLog.code = "DATA_EXIST";
                errorLog.message = "Technology already available"
                return res.status(400).send(errorLog);
            }
        });
    };

    getAllTechnologyService(req, res, next) {
        TechnologyModel.find((error, getAllTechnology) => {
            res.setHeader('content-type', 'application/json');
            if (error) {
                return next(error);
            }
            return res.status(200).send(getAllTechnology);
        });
    };

    deleteTechnologyService(swaggerParam, res, next) {
        let _id = swaggerParam.technology_id.value;
        TechnologyModel.deleteOne({_id}, (error, deleteStatus) => {
            res.setHeader('content-type', 'application/json');
            if (error) {
                return next(error);
            }
            else if (deleteStatus.deletedCount === 1) {
                return res.status(200).send({message: "technology deleted successfully"});
            }
            else {
                errorLog.code = "DATA_NOT_EXIST";
                errorLog.message = "There is no any data ordered by you";
                return res.status(404).send(errorLog);
            }
        });
    };

    addTopicService(swaggerParam, res, next) {
        let payload = swaggerParam.topicPayload.value;
        let topicObject = new TopicModel({
            technology: payload.technology,
            topic: payload.topic
        });
        _topicVerify(topicObject.topic, (error, topicCount) => {
            res.setHeader('content-type', 'application/json');
            if(!topicCount) {
                topicObject.save((error, insertedObject) => {
                   if(error) {
                       errorLog.code = "RUNTIME_ERROR";
                       errorLog.message = "An error occured while add topic in topic schema";
                       return res.status(400).send(errorLog);
                   }
                   return res.status(201).send(insertedObject);
                });
            }
            else if(error) {
                errorLog.code = "RUNTIME_ERROR";
                errorLog.message = "An error occured while verify requested email & password";
                return res.status(400).send(error);
            }
            else {
                errorLog.code = "DATA_EXIST";
                errorLog.message = "Topic is already available";
                return res.status(400).send(errorLog);
            }
        });

    };

    getAllTopicService(swaggerParam, res, next) {
        TopicModel.aggregate([
            { $group : { _id : "$technology", topic: { $push: "$$ROOT"}}},
            { $project: { 'topic': 1, '_id': 1 } }
        ], (error, response) => {
            if (error) {
                errorLog.code = "RUNTIME_ERROR";
                errorLog.message = `An error occured while return all topic`;
                return res.status(400).send(errorLog);
            }
            let allTopic = [];
            response.forEach((res) => allTopic = allTopic.concat(res.topic));
            if (!allTopic.length) {
                errorLog.code = "DATA_NOT_EXIST";
                errorLog.message = `There is no any topic available`;
                return res.status(404).send(errorLog);
            }
            return res.status(200).send(allTopic);
        });
    };

    addDocumentService(req, res, next) {
        let {technology, topic, selectedDocument, selectedLink} = req.swagger.params;
        let documentObject = new DocumentationModel({
            technology: technology.value,
            topic: topic.value,

        });
        if(selectedDocument.value) {
            const {originalname,buffer} = selectedDocument.value;
            let filename = fs.createWriteStream(`upload/video/${originalname}-${Date.now()}`);
            filename.once('open', () => {
                filename.write(buffer);
            });
            const filePath = `upload/video/${originalname}-${Date.now()}`
            const dbFilePath = `http://localhost:3000/${filePath}`;
            documentObject = {...documentObject,selectedDocument: {tutorial : dbFilePath}}
        }
        if(selectedLink.value) {
            documentObject = {...documentObject.selectedDocument,selectedLink: selectedLink.value}
        }
        documentObject.save((error, insertedDocument) => {
            if(error) {
                errorLog.code = "RUNTIME_ERROR";
                errorLog.message = `There is an error while add documentation`;
                return res.status(400).send(errorLog);
            }
            res.setHeader('content-type', 'application/json');
            return res.status(201).send(insertedDocument);
        });
    };

    getAdminService(swaggerParam, res, next) {
        let registerId = swaggerParam.register_id.value;
        AdminModel.findById(registerId, (err, response) => {
            if(err) {
                return next(err);
            }
            res.setHeader('content-type', 'application/json');
            console.log('GET call for admin register has been successfully completed')
            res.status(201).send(response);
        });
    };

}

module.exports = AdminService;


function _checkvalidation(emailId, callback) {
    AdminModel.countDocuments({emailId: emailId}, (err, response) => {
        if(err) {
            return callback(err);
        }
        return callback(null, response);
    });
};

function _technologyVerify(technology, callback) {
    TechnologyModel.countDocuments({technology}, (error, technologyCounted) => {
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

function _topicVerify(topic, callback) {
    TopicModel.countDocuments({topic}, (error, topicCounted) => {
        if (error) {
            log(
                chalk.red(`An error occured while verify topic is available`),
                error
            );
            return callback(error);
        }
        return callback(null, topicCounted);
    });
}

