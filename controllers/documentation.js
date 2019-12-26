'use strict';
const express = require("express");
const documentationRoutes = express.Router();

const {
  documentMarkAsRead,
  TraineeDocument
} = require('../services/documentation');

documentationRoutes.get('/markasread/:traineeId',TraineeDocument);
documentationRoutes.post('/trainee-markasread/:traineeId',documentMarkAsRead);

module.exports = documentationRoutes;