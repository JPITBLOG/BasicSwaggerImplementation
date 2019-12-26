//import admin services
const adminService = require('../services/adminService');
//make object for admin services
let admin = new adminService();
//function for create new admin
module.exports.createAdminRegister = function createAdminRegister(req, res, next) {
    console.log("error in register: ",req);
    admin.createAdminService(req.swagger.params, res, next);
};
//function for login admin
module.exports.adminLogin = function adminLogin(req, res, next) {
    admin.adminLoginService(req.swagger.params, res, next);
}

module.exports.addTechnology = function addTechnology(req, res, next) {
    admin.addTechnologyService(req.swagger.params, res, next);
};

module.exports.getAllTechnology = function getAllTechnology(req, res, next) {
    admin.getAllTechnologyService(req, res, next);
};

module.exports.deleteTechnology = function deleteTechnology(req, res, next) {
    admin.deleteTechnologyService(req.swagger.params, res, next);
};

module.exports.addTopic = function addTopic(req, res, next) {
    console.log('```````````inside controller');
    admin.addTopicService(req.swagger.params, res, next);
};

module.exports.getAllTopic = function getAllTopic(req, res, next) {
    admin.getAllTopicService(req.swagger.params, res, next);
};

module.exports.addDocument = function addDocument(req, res, next) {
    admin.addDocumentService(req, res, next);
};

module.exports.getAdminRegister = function getAdminRegister(req, res, next) {
    let admin = new adminService('sdsd');
    admin.getAdminService(req.swagger.params, res, next);
};
