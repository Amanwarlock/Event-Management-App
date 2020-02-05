'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const bp = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("./logger");
const Mongoose = require("mongoose");
var express = require('express');
const path = require("path");
var jwt = require("jsonwebtoken");
const url = process.env.MONGO_URL;
module.exports = app; // for testing

/**-------------------------------------------------------------------------------- */
// FILE UPLOAD SET UP
const assetCtrl = require("./api/controllers/assets.controller");
const crud = require("./api/helpers/crud");
const crudVoidInstance = new crud();
const GridFs = crudVoidInstance.GridFs();
let gfs = null;
const upload = GridFs.storageEngine(process.env.MONGO_URL,assetCtrl.collectionName);
global.upload = upload;
assetCtrl.init(app);
/**-------------------------------------------------------------------------------- */

var config = {
  appRoot: __dirname // required config
};

app.use(bp.json({limit: '50mb'}));
app.use(bp.urlencoded({limit: '50mb',extended: true}));
app.use(cors());
//app.use(morgan('dev'));
app.use(morgan('combined', { stream: logger.stream }));
app.use("/api/node_modules", express.static(path.join(__dirname, "node_modules"), { maxAge: 21600000 }));


Mongoose.connect(url,{useNewUrlParser: true,useUnifiedTopology: true},function(err){
  if(err){
      console.log("Error Occured while connecting to mongodb ", err);
  }else{
      console.log("Connected to the DB : ", url);
      gfs = GridFs.init(assetCtrl.collectionName);
      global.gfs = gfs;
      assetCtrl.gfs(gfs,upload);
  }
});

//validate.init(Mongoose);

app.use(function (req, res, next) {
  if (req.url === "/api/v1/login" || req.url === "/api/v1/isLoggedIn") {
    next();
  }
  else if (req.headers["Authorization"] || req.headers["x-access-token"] || req.headers['authentication']) {
    const token = req.headers["Authorization"] || req.headers["x-access-token"] || req.headers['authentication'];
    validateToken(token).then(data=> {
      if(data.isValid){
        req.user = data.user;
        next();
      }else{
        res.status(401).send({ "message": "UnAuthorized , Authentication failed" });
      }
    }).catch(e=> res.status(401).send({ "message": "UnAuthorized , Authentication failed" }));
  } else {
    res.status(403).send({ "message": "No Token , Access Forbidden" });
  }
});

function validateToken(token){
  return new Promise((resolve,reject)=>{
      // Validate JWT token;
      const jwtPromise = new Promise((resolve,reject)=>{
          jwt.verify(token, process.env.secretKey, function (err, decoded) {
              if (err) {
                reject(new Error(`JWT Token invalid`));
              } else {
                resolve(decoded);
              }
            });
      });

      jwtPromise.then(decoded => {
          Mongoose.connection.db.collection('users').findOne({email: decoded.email, token: token},{_id:1, email:1,token:1},function(err,doc){
              if(doc) resolve({isValid: true, user: decoded});
              else reject({isValid: false});
          });
      }).catch(e =>{
          reject(e);
      });
     
  });
}

app.post("/api/v1/asset/upload", upload.single('uploadedFile'),(req,res)=>{
  assetCtrl.upload(req,res);
});


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  console.log("Backend server started on port",port);

  console.log('try this:\ncurl http://127.0.0.1:' + port + '/api/heartbeat');
});
