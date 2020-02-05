"use strict;"
const Mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const http = require("http");
const base64ToImage = require('base64-to-image');

var app, gfs,upload;

const collectionName = 'asset';
const Crud = require("../helpers/crud");

const definition = require("../helpers/asset.model");
const crudder = new Crud(definition,collectionName,null,null); 
const GridFs = crudder.GridFs();

function init(_app){
    app = _app;
}

function gfs(_g,_u){
    gfs = _g;
    upload = _u;
}

//GridFs.init(collectionName);

//const upload = GridFs.storageEngine(process.env.MONGO_URL,collectionName);


function uploadFile(req,res){
//    let uploader = upload.single('uploadedFile');
//    uploader(req,res,function(err){
//        if(err){
//            res.status(400).send({message: err.message});
//        }else{
//         res.status(200).send({message: `File upload successfull`, fileInfo: req.file});
//        }
//    });
    gfs.files.findOneAndUpdate({filename: req.file.filename},{$set: {originalname: req.file.originalname}},function(err,doc){
        res.status(200).send({message: `File upload successfull`, fileInfo: req.file});
    });
}

function getFile(req,res){
    const params = req.swagger.params;
    const fileName = params['fileName'].value;
    gfs.files.findOne({filename: fileName},function(err,file){
        if(err){
            res.status(400).send({message: err.message});
        }else if(file){
            res.status(200).send(file)
        }else{
            res.status(400).send({message: "File Not Found"});
        }
    });
}

function getAssetDoc(req,res){
    const params = req.swagger.params;
    const id = params['id'].value;
    // gfs.files.findOne({_id: id},function(err,doc){
    //     if(err){
    //         res.status(400).send({message: err.message})
    //     }else if(doc){
    //         res.status(200).send(doc);
    //     }else{
    //         res.status(400).send({message: `Not Found`});
    //     }
    // });
    // gfs.files.findOne({_id: id},function(err,doc){
    //     if(err){
    //         res.status(400).send({message: err.message})
    //     }else if(doc){
    //         res.status(200).send(doc);
    //     }else{
    //         res.status(400).send({message: `Not Found`});
    //     }
    // });

    gfs.files.find().toArray(function(err,doc){
        if(err){
            res.status(400).send({message: err.message})
        }else if(doc){
            res.status(200).send(doc);
        }else{
            res.status(400).send({message: `Not Found`});
        }
    });
}

function getImage(req,res){
    const params = req.swagger.params;
    const fileName = params['fileName'].value;
    const contentType = ['image/jpeg','img/png'];
    gfs.files.findOne({filename: fileName},function(err,file){
        if(err){
            res.status(400).send({message: err.message});
        }else if(file && contentType.indexOf(file.contentType)){
            const readStream = gfs.createReadStream(file.filename);
            readStream.pipe(res);
        }else{
            res.status(400).send({message: "File Not Found"});
        }
    });
}

function uploadBase64(req,res){
    const params = req.swagger.params;
    const body = params['data'].value;
    const base64 = body.base64;
    const fileName = imageName('png');
    const filepath = path.join(process.cwd(),'Uploads',fileName);
    optionalObj = {'fileName': fileName, 'type':'png'};
    const imageInfo = base64ToImage(base64,filepath,optionalObj);
    const gfsWriteStream = global.gfs.createWriteStream({filename: fileName});
    const readStream = fs.createReadStream(path.join(process.cwd(), "Uploads",`${fileName}${fileName}`));
    const stream = readStream.pipe(gfsWriteStream);

    stream.on('finish',()=>{
        console.log("Finished-------------------");
    });
}

function imageName(imgType){
    const date = new Date().valueOf();
    let text = '';
    const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(Math.floor(Math.random() *    possibleText.length));
    }
    const imageName = date + '.' + text + "." + imgType;
    return imageName;
  }


  function httpInternalizer(headers, payload, httpBody, interceptor) {

    var req = {
        "swagger": { "params": {} },
        "headers": headers ? headers : {}
    };

    if (httpBody && httpBody.createdBy) {
        req.user = { username: httpBody.createdBy, _id: httpBody.createdBy };
    }

    if (headers && headers.username) {
        req.user = { username: headers.username };
    }

    if (headers && headers._id) {
        req.user = { _id: headers._id };
    }

    Object.keys(payload).map(k => {
        req.swagger.params[k] = { value: payload[k] };
    });

    if (httpBody) {
        req.body = httpBody;
    }

    var res = {
        "status": function (statusCode) {
            return {
                "statusCode": statusCode,
                "send": function (data) {
                    if (statusCode === 200) {

                        if (data.constructor.name === 'model') {
                            data = data.toObject();
                        }

                        interceptor(null, data);
                    }
                    else {
                        interceptor(data); //Error
                    }
                },
                "json": function (data) {
                    if (statusCode === 200) {

                        if (data.constructor.name === 'model') {
                            data = data.toObject();
                        }

                        interceptor(null, data);
                    }
                    else {
                        interceptor(data); //Error
                    }
                }
            }
        }
    };

    return { req: req, res: res }
}


module.exports = {
    init: init,
    gfs: gfs,
    collectionName: collectionName,
    upload: uploadFile,
    getFile: getFile,
    getAssetDoc: getAssetDoc,
    getImage:getImage,
    uploadBase64: uploadBase64
}