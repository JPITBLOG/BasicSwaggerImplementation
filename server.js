'use strict';
// Public node modules
const cors = require("cors");
const config = require('config');
const express = require("express");
const mongoose = require("mongoose");
const chalk = require('chalk');
const jsyaml = require('js-yaml');
const fs = require('fs');
const http = require('http');
//swagger
const swaggerUi = require('swagger-ui-express');
const swaggerTools = require('swagger-tools');

// Variable declaration
const app = express();
const port = 8001 || process.env.PORT;
const log = console.log;
const {
 adminRoutes, beginnerRoutes, documentationRoutes
} = require('./controllers');

// Database connectivity and it's utils
mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongo.host'), config.get('mongo.options'), (error, response) => {
    if(error){
      log(chalk.red('An error occurred while making a connection with database'), error);
      return process.exit(1);
    }
    log(chalk.green('Database successfully connected'));
});

// app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/upload/video'));

// swaggerRouter configuration
var options = {
    swaggerUi: __dirname + '/API/swagger.json',
    controllers: __dirname + '/controllers'
};

var spec = fs.readFileSync(__dirname + '/API/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    app.use(cors());
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    app.use(middleware.swaggerUi({}));

    app.use(function error(err, req, res, next) {
        if (err) {
            console.log("error like: "+err);
            let error = {
                message: err.Error,
                code: err.code,
                error: err.results.errors
            };
            return res.status(400).send(error);
        }
        return next();
    });
    http.createServer(app).listen(3000, (err, response) => {
        if (err) {
            return  console.log('error in connection');
        }
        console.log('listing on port 3000');
    });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
//require('./app/router')(app);

//app.listen(3000);
