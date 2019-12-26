'use strict';
const chalk = require("chalk");
const path = require("path");
const async = require("async");
const {AdminModel,
       BeginnerModel,
       DocumentationModel,
       TechnologyModel,
       TopicModel,
       TraineeDocumentationModel} = require('../model/index');

const jwt = require("jsonwebtoken");

const log = console.log;

const access = 'auth';

const adminRegister = async (req, res) => {
    let adminRegister = new AdminModel({
        name : req.body.name,
        emailId : req.body.emailId,
        password : req.body.password
    });
    await AdminModel.RegisterVerify(adminRegister.emailId, (error, isRecordExist) => {
        if(isRecordExist) res.status(400).send({message:"Admin already available"});
        else {
            adminRegister.save().then(async (response) => {
                if(!response) res.status(400).send({message:"error while adding data"});
                let token = await jwt.sign({_id:response._id,access},'sign123').toString();
                let adminObject = {
                    ...response.getDetails(),token
                };
                res.status(200).send(adminObject);
            });
        }
    });
};

const adminLogin = async (req, res) => {
    let loginData = {
        emailId : req.body.emailId,
        password : req.body.password
    };
    AdminModel.LoginVerify(loginData, (error, adminRecord) => {
        if(error) res.status(400).send({message:"Invalid credentials.."})
        try{
            let token = jwt.sign({_id:adminRecord._id,access,name:adminRecord.name},'sign123').toString();
            let adminObject = {
                ...adminRecord.toJSON(),token
            };
            res.status(200).send(adminObject);
        }
        catch (e) {
            res.status(400).send({message : "Invalid Credentials"});
        }
    });
};

const addTechnology = (req,res) => {
    let addTechnologyObject = new TechnologyModel ({ technology : req.body.technology,hours : req.body.hours });
    TechnologyModel.technologyVerify(addTechnologyObject.technology,(error,technologyCount) => {
        if(!technologyCount){
            addTechnologyObject.save().then( (response) => {
                if(!response) res.status(400).send({message : "error while adding data"});
                res.status(201).send(response.getDetails());
            });
        }
        else {
            res.status(400).send({message : "Technology already available"});
        }
    });
};

const getTechnology = async (req,res) => {
    TechnologyModel.getAllTechnology((error, getAllTechnology) => {
        if(error) {
            res.status(400).send(error);
        }
        else {
            let allTechnology = getAllTechnology.map((technology) => {
                return technology.getDetails();
            });
            res.status(200).send(allTechnology);
        }
    });
};

const deleteTechnology = async (req, res) => {
    let dltId = req.params.deleteId;
    TechnologyModel.deleteTechnology(dltId, (error, deleted) => {
        if (deleted) {
            res.status(200).send({message:"Technology successfully deleted: "+dltId});
        }
        else res.status(400).send({message:"There is an error while delete technology: "+dltId});
    });
};

const addTopic = (req, res) => {
    let topicDataObject = new TopicModel({
        technology : req.body.technology,
        topic : req.body.topic
    });
    TopicModel.topicVerify(topicDataObject.topic,(error, topicCounted) => {
        if (error) {
            res.status(400).send({message: error});
        }
        else if (!topicCounted) {
            topicDataObject.save().then((addedTopic) => {
                if (addedTopic) {
                    res.status(200).send(addedTopic);
                }
                else {
                    res.status(400).send({message:"There is an error while add topic"});
                }
            });
        }
        else res.status(400).send({message:`topic ${topicDataObject.topic} already available`});
    });
};

const getTopic = (req, res) => {
    TopicModel.getAllTopic((error, allTopic) => {
        if (allTopic) {
            res.status(200).send(allTopic);
        }
        else res.status(400).send({message:"there is an error while getting topic"});
    });
};


const addDocumentation = (req, res) => {
    let addDocument = {
        technology : req.body.technology,
        topic : req.body.topic
    };
    if (req.file) {
        let videoDocument = req.file.filename;
        let videoObject = path.format({dir:'http://localhost:8001',base:`${videoDocument}`});
        addDocument = {...addDocument,selectedDocument : {tutorialLink : videoObject}};
    }
    if (req.body.selectedLink) {
        let selectedLink = req.body.selectedLink;
        if (addDocument.hasOwnProperty("selectedDocument")) addDocument.selectedDocument["documentLink"] = selectedLink;
        else addDocument = {...addDocument,selectedDocument : {documentLink : selectedLink}};
    }
    addDocument = new DocumentationModel(addDocument);
    addDocument.save().then((documentObject) => {
        let trainyId = null;
        const technologyId = documentObject.technology;
        _getTechnoNameTopicName([documentObject], {technologyId, trainyId},
            (error, documentResponse) => {
                if (documentResponse) {
                    res.status(200).send(documentResponse[0]);
                }
            });
    }).catch((error) => {
       res.status(400).send({message:"There is an error while add document"});
    });
};

const getDocumentation = (req, res) => {
    let technologyId = req.params.technologyId;
    let trainyId = req.params.trainyId;
    DocumentationModel.getTechnologyDocument(technologyId,(error, allTechnologyDocument) => {
        if(allTechnologyDocument){
            let documentResponse = [];
            documentResponse = allTechnologyDocument;
            _getTechnoNameTopicName(documentResponse,{technologyId, trainyId},(error, documentResponse) => {
                if(documentResponse){
                    res.status(200).send(documentResponse.reverse());
                }
                else res.status(400).send({message:"error while mapp technology & topic name"});
            });
        }
        else {
            res.status(400).send({message:'error occur while getting technology document'});
        }
    });
};

const updateDocumentation = async (req,res) => {
    let documentId = req.params.documentId;
    let technologyId = req.body.technology;

    let addDocument = {
        technology : technologyId,
        topic : req.body.topic
    };

    if (req.file) {
        let videoDocument = req.file.filename;
        let videoObject = path.format({dir:'http://localhost:8001',base:`${videoDocument}`});
        addDocument = {...addDocument,selectedDocument : {tutorialLink : videoObject}};
    }

    if (req.body.selectedLink) {
        let selectedLink = req.body.selectedLink;
        if(addDocument.hasOwnProperty("selectedDocument")) addDocument.selectedDocument["documentLink"] = selectedLink;
        else addDocument = {...addDocument,selectedDocument : {documentLink : selectedLink}};
    }

    DocumentationModel.updateDocument({documentId,addDocument},(error,responseObject) => {
        if (responseObject) {
            let trainyId = null;
            _getTechnoNameTopicName([responseObject],{technologyId,trainyId},
                (error, documentResponse) => {
                    if(documentResponse){
                        res.status(200).send(documentResponse[0]);
                    }
            });
        }
        else res.status(400).send({messaage:"there is an error while update data"});
    });
};

const deleteDocumentation = (req,res) => {
    let document_id = req.params.document_id;
    DocumentationModel.deleteDocument(document_id,(error, deletedDocument) => {
        console.log("deleted document: "+JSON.stringify(deletedDocument));
        if (deletedDocument.deletedCount) res.status(200).send({message:"document deleted successfully"});
        else res.status(400).send({message:"there is an error while delete document"});
    });
};

const deleteDocumentByTopic = async (req,res) => {
    let topic_id = req.params.topic_id;
    DocumentationModel.deleteDocumentTopicWise(topic_id,(error, deleteDocuments) => {
        if(deleteDocuments){
            TopicModel.deleteTopic(topic_id,(error, response) => {
                if(response) res.status(200).send({message:"topic deleted successfully"});
                else res.status(400).send({message:"there is an error while delete topic"});
            });
        }
        else {
            res.status(400).send({message:"there is no any related topic"});
        }
    });
};

function _getTechnoNameTopicName(documentResponse, technologyAndTrainyId, callback){
    const {technologyId,trainyId} = technologyAndTrainyId;
    let technologyName = '';
    TechnologyModel.findTechnologyName(technologyId,(error, foundedTechnology) => {

        if(foundedTechnology){
            technologyName = foundedTechnology.technology;
        }
    });
    let newDocumentMapped = [];
    async.eachSeries(documentResponse, (document,cb) => {
        let documentation = document._id;
        let currentDocument = {};
        currentDocument = {
            _id:document._id,
            technology:document.technology,
            topic:document.topic,
            selectedDocument:document.selectedDocument,
            markAsRead:false
        };
        if(trainyId !== null){
            console.log("got the service: ")
            TraineeDocumentationModel.getTraineeMarkedDocument({documentation,trainyId},(error,responseData) => {
                if(responseData || error) {
                    TopicModel.findTopicName(currentDocument.topic,(error,response) => {
                        if(response){
                            if (responseData) currentDocument.markAsRead = true
                            currentDocument.technology = technologyName;
                            currentDocument.topic = response;
                            newDocumentMapped.push(currentDocument)
                            cb()
                        }
                    })

                }
            })
        }
        else {
            console.log("got the service in service : ")
            TopicModel.findTopicName(currentDocument.topic,(error,topic) => {
                if(topic){
                    console.log("error found like: "+topic);
                    currentDocument.technology = technologyName;
                    currentDocument.topic = topic;
                    newDocumentMapped.push(currentDocument)
                    cb()
                }
            })
        }
    },(eachSeriesErr) => {
        if (eachSeriesErr){
            return callback(eachSeriesErr)
        }
        return callback(null,newDocumentMapped.reverse());
    })
}

module.exports = {
    adminRegister,
    adminLogin,
    addTechnology,
    getTechnology,
    deleteTechnology,
    addTopic,
    getTopic,
    addDocumentation,
    getDocumentation,
    updateDocumentation,
    deleteDocumentation,
    deleteDocumentByTopic
}