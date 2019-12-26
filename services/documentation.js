const {DocumentationModel,
       TraineeDocumentationModel} = require('../model/index');


const documentMarkAsRead = (req, res) => {
    let traineeId = req.params.traineeId;
    let traineeDocumentation = new TraineeDocumentationModel({
        traineeId : traineeId,
        technology : req.body.technology,
        topic : req.body.topic,
        documentation : req.body._id,
        markAsRead : req.body.markAsRead
    });
    const {documentation, markAsRead} = traineeDocumentation;
    TraineeDocumentationModel.isAvailableDocument({traineeId, documentation, markAsRead},(error, updatedTraineeDocument) => {
        if (error) {
            traineeDocumentation.save().then((traineeDocument) => {
                if (traineeDocument) {
                    getMarkAsReadDocument(traineeDocument, (error, responseData) => {
                        if (responseData) {
                            res.status(200).send(responseData);
                        }
                        else res.status(400).send({message : "there is an error while mapp data with document"});
                    });
                }
                else res.status(400).send({message : "there is an error while save marked data"});
            });
        }
        else{
            getMarkAsReadDocument(updatedTraineeDocument, (error, responseData) => {
                if (responseData) {
                    res.status(200).send(responseData);
                }
                else res.status(400).send({message : "there is an error while mapp data with document"});
            });
        }
    });
};

const getMarkAsReadDocument = (trainyMarkedDetail, callback) => {
    const {documentation, markAsRead, technology, topic} = trainyMarkedDetail;
    DocumentationModel.getDocumentation(documentation, (error, documentation) => {
        if (documentation) {
            let newResp = documentation.getDetails();
            newResp.technology = technology;
            newResp.topic = topic;
            newResp = {...newResp,markAsRead};
            callback(null, newResp);
        }
        else callback(true);
    });
};

const TraineeDocument = (req, res) => {
    let traineeId = req.params.traineeId;
    TraineeDocumentationModel.getAllDocumentOfTrainee(traineeId,(error, traineeDocument) => {
        if(traineeDocument) res.status(200).send(traineeDocument);
        else res.status(400).send({message:"there is an error while fetch trainyMarked data"});
    });
};

module.exports = {
    documentMarkAsRead,
    TraineeDocument
}