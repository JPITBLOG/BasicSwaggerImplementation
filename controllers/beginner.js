'use strict';
const express = require("express");
const router = express.Router();

const {
  beginnerRegister,
  beginnerLogin,
  AllTrainee,
  getTechnologyBasedTrainee,
  addTechnologyHours,
  removeTechnoHours
} = require('../services/beginner');

router.post('/register/', beginnerRegister);
router.post('/login/', beginnerLogin);
router.post('/addtechnohours/', addTechnologyHours);
router.post('/removetechnohours/:_id/:removeTechnologyHours', removeTechnoHours);
router.get('/trainy/getalltrainy', AllTrainee);
router.get('/trainy/gettechnobasedtrainy/:selectedTechnology/:technologyStatus', getTechnologyBasedTrainee);

module.exports = router;