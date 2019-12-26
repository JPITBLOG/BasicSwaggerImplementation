const async = require("async");
const {AdminModel,
       BeginnerModel,
       DocumentationModel,
       TechnologyModel,
       TopicModel,
       TraineeDocumentationModel} = require('../model/index');
const jwt = require("jsonwebtoken");

const access = 'auth';
const beginnerRegister = async(req, res) => {
    let beginnerRegister = new BeginnerModel({
        name : req.body.name,
        emailId : req.body.emailId,
        password : req.body.password,
        technoHours : null
    });
    BeginnerModel.RegisterVerify(beginnerRegister.emailId, (userNotAvailable, userAvailable) => {
        if(userAvailable) res.status(400).send({message:"User already available"});
        else {
            BeginnerModel.save().then(async (response) => {
                if(!response) res.status(400).send({message:"error while adding data"});
                let token = await jwt.sign({_id:response._id,access},'sign123').toString();
                let beginnerObject = {
                    ...response.getDetails(),token
                };
                res.status(200).send(beginnerObject);
            });
        }
    });
};

const beginnerLogin = (req, res) => {
    let loginData = {
        emailId : req.body.emailId,
        password : req.body.password
    };
    BeginnerModel.LoginVerify(loginData, (error, beginnerRecord) => {
        if(error) res.status(400).send({message:"there is an error while verify beginner"});
        else if (beginnerRecord) {
            let token = jwt.sign({_id:beginnerRecord._id, access}, 'sign123').toString();
            let beginnerObject = {
                ...beginnerRecord.toJSON(),token
            };
            res.status(200).send(beginnerObject);
        }
        else res.status(200).send({message:"Invalid credentials.."});
    });
};

const AllTrainee = (req, res) => {
    BeginnerModel.getAllTrainee((error, allTrainee) => {
        if(allTrainee) {
            LanguageInfo(null,(error, languageResp) => {
                if(languageResp) {
                    TraineeTechnologyInfo(null, allTrainee, languageResp,(error, response) => {
                        if(response) res.status(200).send(response);
                    });
                }
                else res.status(400).send({message : "there is an error while mapping language info with trainy"});
            });
        }
        else res.status(400).send({message : "there is an error while get All Trainy"});
    });
};

const getTechnologyBasedTrainee = (req, res) => {
    let selectedTechnology = req.params.selectedTechnology;
    let technoStatus = req.params.technologyStatus;
    const query = {};
    BeginnerModel.getAllTrainee(query, (error, allTrainee) => {
        if (allTrainee) {
            LanguageInfo(selectedTechnology,(error, languageResponse) => {
                TraineeTechnologyInfo(technoStatus, allTrainee, languageResponse,(error, technologyInfo) => {
                    if (technologyInfo) res.status(200).send(technologyInfo);
                    else res.status(400).send({message:"there is an error while mapping trainy data"});
                });
            });
        }
        else res.status(400).send({message:"there is an error while get trainy data"});
    });
};

const addTechnologyHours = (req, res) => {
    let technoHoursobj = {
        technologyName : req.body.technologyName,
        technologyHours : req.body.technoHours,
        _id : req.body._id
    };
    BeginnerModel.upsertTechnoHours(technoHoursobj,(error, technologyHours) => {
        if (technologyHours) {
            res.status(200).send(technologyHours);
        }
        else res.status(400).send({message:"there is an error while add technology hours"});
    });
};

const removeTechnoHours = (req, res) => {
    let _id, removeTechnologyHours;
    _id = req.params._id;
    removeTechnologyHours = req.params.removeTechnologyHours;
    BeginnerModel.removeTechnoHours(_id, removeTechnologyHours, (error, technologyHours) => {
        if (technologyHours) {
            res.status(200).send(technologyHours);
        }
        else res.status(400).send({message:"there is an error while delete technology hours"});
    });
};

const LanguageInfo = (selectedTechno, callback) => {
    let selectedTechno_name = null;
    let technoDocumentCount = [];
    DocumentationModel.CountTechnologyDocument((error, documentResponse) => {
        if (documentResponse) {
            technoDocumentCount = documentResponse;
            async.eachSeries(technoDocumentCount,(document,cb) => {
                TechnologyModel.findTechnologyName(document._id,(error, TechnologyObject) => {
                    if (TechnologyObject) {
                        if (selectedTechno) {
                            selectedTechno == TechnologyObject._id ? selectedTechno_name = TechnologyObject.technology : null;
                        }
                        document._id = TechnologyObject.technology;
                    }
                    cb();
                });
            },(eachSeriesErr) => {
                if(eachSeriesErr) return callback(eachSeriesErr);
                return callback(null, {technoDocumentCount, selectedTechno_name});
            });
        }
        else return callback(true);
    });
};

const TraineeTechnologyInfo = (technoStatus, allTrainee, languageResp, callback) => {
    const {technoDocumentCount, selectedTechno_name} = languageResp;
    let allTraineeTechnoInfo = [];
    let complete = [], running = [], pending = [];
    async.eachSeries(allTrainee, (trainee, eachLimitCb) => {
        let traineeObj = {
            _id: trainee.id,
            name: trainee.name,
            emailId: trainee.emailId,
            password: trainee.password,
            indTime: trainee.time.toDateString(),
            technoHours: trainee.technoHours
        };
        complete = [];
        running = [];
        pending = [];
        async.eachSeries(technoDocumentCount, (technology, eachSeriesCb) => {
            TraineeDocumentationModel.countDocumentByTechnology( traineeObj._id, technology._id, (error, traineeDocumentCount) => {
                if (traineeDocumentCount > 0 && traineeDocumentCount === technology.count) {
                    complete.push(technology._id);
                } else if (traineeDocumentCount > 0 && traineeDocumentCount < technology.count) {
                    running.push(technology._id);
                } else if(traineeDocumentCount === 0) {
                    pending.push(technology._id);
                }
                eachSeriesCb();
            });
        }, (eachSeriesError) => {
            if (eachSeriesError) {
                return eachLimitCb(eachSeriesError);
            }
            traineeObj['status'] = {
                complete: complete,
                running: running,
                pending: pending
            };
            if (technoStatus !== null) {
                if (traineeObj['status'][technoStatus].includes(selectedTechno_name)) {
                    allTraineeTechnoInfo.push(traineeObj);
                }
            }
            else allTraineeTechnoInfo.push(traineeObj);
            eachLimitCb();
        });
    }, (eachLimitError) => {
        callback(eachLimitError, allTraineeTechnoInfo);
    });
};

module.exports = {
    beginnerRegister,
    beginnerLogin,
    AllTrainee,
    getTechnologyBasedTrainee,
    addTechnologyHours,
    removeTechnoHours
}