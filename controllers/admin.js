'use strict';
const express = require("express");
const chalk = require('chalk');
const multer = require("multer");

const log = console.log;
const router = express.Router();

const {
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
} = require('../services/admin');

const storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './upload/video');
    },
    filename: function (req, file, callback) {
        console.log("file goted or not: "+file.originalname);
        callback(null,'document-' + Date.now() + '.' + file.originalname);
    }
});

const upload = multer({
    storage: storage
});

router.post('/register/', adminRegister);
router.post('/login/', adminLogin);
// router.use('/technology/',validateToken)
router.post('/technology/addtechnology', addTechnology);
router.get('/technology/getalltechnology', getTechnology);
router.delete('/technology/deleteTechnology/:deleteId', deleteTechnology);
router.post('/topic/addtopic', addTopic);
router.get('/topic/alltopic', getTopic);
router.delete(`/topic/delete-topic/:topic_id`, deleteDocumentByTopic);
router.post(
  '/documentation/adddocumentation',
  upload.single('selectedDocument'),
  addDocumentation
);
router.post(
  '/documentation/UpdateDocumentation/:documentId',
  upload.single('selectedDocument'),
  updateDocumentation
);
router.get('/documentation/getDocumentation/:technologyId/:trainyId', getDocumentation);
router.delete('/documentation/deletedocumentation/:document_id', deleteDocumentation);

module.exports = router;