"use strict;"

const Mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const jsonexport = require("jsonexport");
const csvjson = require("csvjson");
const csvTojson=require('csvtojson')
const _ = require("lodash");
const image2base64 = require('image-to-base64');

const Crud = require("../helpers/crud");
const eventDefinition = require("../helpers/event.definitions");
const counter = require("../helpers/counter");
const pdfGenerator = require("../helpers/pdf.generator");
const schema = new Mongoose.Schema(eventDefinition)

const uploadDir = "Uploads";

schema.pre("save", function(next){
    console.log("Running prehook for ID generation..........");
    let self = this;
    if(!self._id){
        counter.getCount("event","event","EVNT", 100,function(err,doc){
            if(err) next(err);
            else if(doc){
                self._id = doc.prefix + doc.next;
                next();
            }else{
                next(new Error(`Error occured while generating the ID for user collection`));
            }
        });
    }else{
        next();
    }
});


const crudder = new Crud(eventDefinition,'event',schema,null);

function eventIndex(req,res){
    crudder._index(req,res,{resolveReq: true});
}

function createEvent(req,res){
    const params = req.swagger.params;
    let body = params['data'].value;
    body.createdBy = req && req.user ? req.user._id : "";
    const guestFile = body.guestFile;

    if(global.gfs){
        async.waterfall([
            _grabGuestFile(body),
            _insertEvent,
        ],function(err,result){
            if(err)
                res.status(400).send({message: err.message});
            else
                res.status(200).send(result);
        });
    }else{
        res.status(400).send({message: 'Event Creation failed, GFS not found'});
    }

    function _grabGuestFile(data){
        return function(callback){
            gfs.files.findOne({filename: data.guestFile},function(err,file){
                if(err){
                    callback(err);
                }else if(file){
                    const readStream = gfs.createReadStream(file.filename);
                    const crudFS = crudder.fs();
                    uploadDirSpawn();
                    const writeStream = fs.createWriteStream(path.join(uploadDir,file.filename));
                    let stream = readStream.pipe(writeStream);
                    stream.on('finish',()=>{
                        body.guests = toJson(file.filename);
                        body.totalGuests = body.guests.length;
                        crudFS.removeFile(path.join(uploadDir,file.filename));
                        callback(null,body);
                    });
                }else{
                    callback(new Error("Event Creation failed, Guest File Not Found"));
                }
            });
        }
    }

    function _insertEvent(data,callback){
        let options = {body: data, createdBy: body.createdBy, resolveReq: false }
        crudder._create(null,null,options).then(doc=>{
            callback(null,doc);
        }).catch(e => callback(e));
    }
   
}


function uploadDirSpawn(){
    const crudFS = crudder.fs();
    const _path = path.join(__dirname, uploadDir);
    let isFolderExists = crudFS.isFolderExists(uploadDir);
    if(!isFolderExists){
        crudFS.createFolder(uploadDir);
    }else{
        console.log("Upload directory exists, skipping creation...........");
    }
}

function toJson(fileName){
    const options = {
        delimiter: ",",
        quote: '"'
    }
    const filePath = path.join(uploadDir, fileName);
    const crudFS = crudder.fs();
    guestCsv = crudFS.readFile(path.join(uploadDir, fileName));
    const json = csvjson.toObject(guestCsv, options);
    // csvTojson().fromFile(filePath).then(data=>{
    //     console.log("JSON 2------------",data);
    // });

    return json;
}

function getEventCount(req,res){
    crudder._count(req,res, {resolveReq: true});
}

function getEventById(req,res){
    crudder._getById(req,res);
}

function eventUpdate(req,res){
   // crudder._update(req,res);
   const params = req.swagger.params;
   let body = params['data'].value;

   if(global.gfs){
    async.waterfall([
        _grabGuestFile(req,res,body),
        _updateEvent,
    ],function(err,result){
        if(err)
            res.status(400).send({message: err.message});
        else{
            res.status(200).send(result);
        }
    });
}else{
    res.status(400).send({message: 'Event Creation failed, GFS not found'});
}

function _grabGuestFile(req,res,data){
    return function(callback){
        gfs.files.findOne({filename: data.guestFile},function(err,file){
            if(err){
                callback(err);
            }else if(file){
                const readStream = gfs.createReadStream(file.filename);
                const crudFS = crudder.fs();
                uploadDirSpawn();
                const writeStream = fs.createWriteStream(path.join(uploadDir,file.filename));
                let stream = readStream.pipe(writeStream);
                stream.on('finish',()=>{
                    body.guests = toJson(file.filename);
                    body.totalGuests = body.guests.length;
                    crudFS.removeFile(path.join(uploadDir,file.filename));
                    callback(null,req,res,body);
                });
            }else{
                callback(new Error("Event Creation failed, Guest File Not Found"));
            }
        });
    }
}

function _updateEvent(req,res,data,callback){
    // req.body = data;
    // req.swagger.params['data'].value = data;
    // crudder._update(req,res);
    let id = body._id;
    let guests = body.guests;
    let totalGuests = body.totalGuests;
    delete body._id;
    crudder.model.findOne({_id: id, deleted: false}).exec().then(doc =>{
        if(!doc){
            callback(new Error(`Not Found`));
        }else{
            console.log("Updating event ............", id);
            let oldDocument = doc.toObject();
            let updatedDocument = _.mergeWith(doc,body,customizer);
            //updatedDocument.guests = guests;
            //updatedDocument.totalGuests = totalGuests;
            //updatedDocument = new crudder.model(updatedDocument);
            //callback(null, updatedDocument);
            crudder.model.findOneAndUpdate({_id: id},updatedDocument, {new: true, useFindAndModify: true}).then(updated=>{
                callback(null,updated);
            }).catch(e=>{
                callback(e);
            });
            // updatedDocument.save(function(err,updated){
            //     if(err){
            //         console.log("Error occured while saving event on uodate", err.message);
            //         callback(err);
            //     }else{
            //         callback(null,updated);
            //     }
            // });
        }
    }).catch(e=>{
        console.log("Error occured while updating event", e.message);
        callback(e);
    });
}

}

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
        return srcValue;
    }
}

function downloadGuestPDF(req,res){
    const params = req.swagger.params;
    const eventId = params['id'].value;
    crudder.model.findOne({_id: eventId}).lean().then(doc=>{
        if(!doc){
            res.status(400).send({message: 'Not Found'});
        }else{
            getSignatures(doc).then(d=>{
                console.log("All signatures fetched..........");
                crudder._randomNumber(16).then(randomId=>{
                    pdfGenerator.generatePDF(randomId, doc).then(pdfFilePath=>{
                        res.download(pdfFilePath, `${randomId}.pdf`); 
                        res.on('finish',function(){
                            console.log("Completed downloading...........");
                            crudder.fs().removeFile(pdfFilePath);
                        });
                    }).catch(e=> res.status(400).send({message: e.message}));
                }).catch(e=>  res.status(400).send({message: e.message}));

            }).catch(e=>{
                console.log("Error -----------",e);
                res.status(400).send({message: e.message});
            })
        }
    }).catch(e=>{
        res.status(400).send({message: e.message});
    });
}

function getSignatures(doc){
    return new Promise((resolve,reject)=>{
        console.log("Getting signatures...........");
        let guests = doc.guests.filter(guest => guest.hasCheckedIn ? true: false);
        Promise.all(guests.map(guest=>{
            return new Promise((_res,_rej)=>{
                let data= "";
                const readStream = gfs.createReadStream(guest.signature);
                // readStream.on('data', _data=> data += _data.toString());
                // readStream.on('end',()=>{
                //     console.log("Data ----------", data);
                //     let base64 = new Buffer(data.toString(), 'base64');
                //     console.log("Base 64 image is -------", base64.toString('base64'));
                // })
                const crudFS = crudder.fs();
                uploadDirSpawn();
                const writeStream = fs.createWriteStream(path.join(uploadDir,guest.signature));
                let stream = readStream.pipe(writeStream);
                stream.on('finish',()=>{
                    image2base64(path.join(uploadDir,guest.signature)).then(base64=>{
                        let base64Prefix = "data:image/png;base64,";
                        base64 = base64Prefix + base64;
                        guest.signatureImg = base64;
                        crudFS.removeFile(path.join(uploadDir,guest.signature));
                        console.log("Calling next---------------");
                        _res(guest);
                    }).catch(e=>{
                        crudFS.removeFile(path.join(uploadDir,guest.signature));
                        _rej(e);
                    });
                
                });
            });
        })).then(result=>{
            console.log("Completed signature conversion from png to base64..........");
            resolve(result);
        }).catch(e => reject(e));

    //    let queue = async.queue(function(guest,queueCB){
        

    //    });

    //    queue.drain = function(){
    //     console.log("Completed signature conversion from png to base64..........");
    //         resolve(doc);
    //    }

    //    queue.push(doc.guests,function(err,result){

    //    });
    });

}

function eventUpdate2(req,res){
    console.log("Running event update 2-----------");
    crudder._update(req,res,{resolveReq:true});
}

module.exports = {
    eventIndex: eventIndex,
    createEvent: createEvent,
    getEventCount: getEventCount,
    getEventById: getEventById,
    eventUpdate: eventUpdate,
    downloadGuestPDF: downloadGuestPDF,
    eventUpdate2: eventUpdate2,

}