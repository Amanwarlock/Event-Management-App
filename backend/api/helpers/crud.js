"use strict;"
const Mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const GridFsStream = require("gridfs-stream"); // Grid

function Crudder(definition,collection,schema=null,logger){
    this.schema = schema;
    this.definition = definition;
    this.collection = collection;
    this.model = null;
    this.logger = logger;

    if(definition && this.definition && !schema) this.schema = this._getSchema(); 

    if(this.collection && this.schema)  this.model = Mongoose.model(this.collection, this.schema);
}

function gridFs(){
    
}

function FS(){

}

Crudder.prototype = {
    _getSchema: function(){
        return new Mongoose.Schema(this.definition);
    },
    _getModel: function(){
        return Mongoose.model(this.collection,this.schema);
    },
    _create: function(req,res,options){
        return new Promise((resolve,reject)=>{
            options = options ? options : {};
            options.createdBy = options.createdBy ? options.createdBy : body.createdBy;
            let body = req && req.swagger.params['data'] ? req.swagger.params['data'].value : options.body;
            body.createdBy = req && req.user ? req.user._id : options.createdBy;
            
            this.model.create(body,function(err,doc){
                if(err){
                    if(options.resolveReq){
                        res.status(400).send({message: err.message});
                        resolve();
                    }else{
                        reject(err);
                    }
                }else{
                    if(options.resolveReq){
                        res.status(200).json(doc);
                        resolve();
                    }else{
                        resolve(doc);
                    }
                }
            });
        });
    },
    _index: function(req,res,options){
        return new Promise((resolve,reject)=>{
            let filter = req.swagger.params['filter'] && req.swagger.params['filter'].value ? req.swagger.params['filter'].value: {};
            let select = req.swagger.params['select'] && req.swagger.params['select'].value && Array.isArray(req.swagger.params['select'].value) ? req.swagger.params['select'].value: [];
            let sort = req.swagger.params['sort'] && req.swagger.params['sort'].value ? req.swagger.params['sort'].value: {};
            let page = req.swagger.params['page'] && req.swagger.params['page'].value ? req.swagger.params['page'].value : 1;
            let count = req.swagger.params['count'] && req.swagger.params['count'].value ? req.swagger.params['count'].value : 10;
            let skip = count * (page - 1);

            if(typeof filter === 'string'){
                try{
                    filter = JSON.parse(filter);
                    filter.deleted = false;
                   
                    Object.keys(filter).map(key=>{
                        if(typeof filter[key] === 'string'){
                            filter[key] = this._RegExSerializer(filter[key]);
                        }else if(Array.isArray(filter[key])){
                            filter[key].map(el=>{
                                if(typeof el === 'string') el = this._RegExSerializer(el);
                                if(typeof el === 'object'){
                                    Object.keys(el).map(k=>{
                                        if(typeof el[k] === 'string'){
                                            el[k] = this._RegExSerializer(el[k]);
                                        }
                                    })
                                }
                            });
                        }
                    });
                }catch(e){
                    filter = {};
                    console.log("Index crudder: filter parse failed ", e.message);
                }
            }

            if(typeof sort === 'string'){
                try{
                    sort = JSON.parse(sort);
                }catch(e){
                    sort = {};
                }
            }

            let query = this.model.find(filter);
            query.lean();

            if(select && Array.isArray(select) && select.length){
                query.select(select.join(" "));
            }

            query.skip(skip).limit(count);

            if(Object.keys(sort).length){
                query.sort(sort);
            }

            query.exec(function(err,docs){
                if(err){
                    if(options.resolveReq){
                        res.status(400).send({message: err.message});
                        resolve();
                    }else{
                        reject(err);
                    }
                }else{
                        if(options.resolveReq){
                            res.status(200).send(docs);
                            resolve();
                        }else{
                            resolve(docs);
                        }
                }
            });

        });
    },
    _getById: function(req,res){
        let id = req.swagger.params['id'] ? req.swagger.params['id'].value : null;
        let select = req.swagger.params['select'] && req.swagger.params['select'].value && Array.isArray(req.swagger.params['select'].value) ? req.swagger.params['select'].value: [];
        let query = this.model.findOne({_id: id});
        query.lean();
        if(select && select.length){
            query.select(select.join(" "));
        }
        query.exec().then(doc=>{
            if(doc){
                res.status(200).send(doc);
            }else{
                res.status(400).send({message: `Not Found`});
            }
        }).catch(e=>{
            res.status(400).send({message: e.message})
        });
    },
    _count: function(req,res,options){
        return new Promise((resolve,reject)=>{
            let filter = req.swagger.params['filter'] && req.swagger.params['filter'].value ? req.swagger.params['filter'].value: {};

            if(typeof filter === 'string'){
                try{
                    filter = JSON.parse(filter);
                    filter.deleted = false;
                   
                    Object.keys(filter).map(key=>{
                        if(typeof filter[key] === 'string'){
                            filter[key] = this._RegExSerializer(filter[key]);
                        }else if(Array.isArray(filter[key])){
                            filter[key].map(el=>{
                                if(typeof el === 'string') el = this._RegExSerializer(el);
                                if(typeof el === 'object'){
                                    Object.keys(el).map(k=>{
                                        if(typeof el[k] === 'string'){
                                            el[k] = this._RegExSerializer(el[k]);
                                        }
                                    })
                                }
                            });
                        }
                    });
                }catch(e){
                    filter = {};
                    console.log("Index crudder: filter parse failed ", e.message);
                }
            }

            let query = this.model.find(filter);
            query.count();

            query.exec(function(err,docs){
                if(err){
                    if(options.resolveReq){
                        res.status(400).send({message: err.message});
                        resolve();
                    }else{
                        reject(err);
                    }
                }else{
                        if(options.resolveReq){
                            res.status(200).json(docs);
                            resolve();
                        }else{
                            resolve(docs);
                        }
                }
            });

        });
    },
    _update: function(req,res){
        const params = req.swagger.params;
        let body = params['data'].value;
        const id = body._id;
        body.modifiedBy = req && req.user ? req.user._id : null;
        body.modifiedAt = new Date();
        delete body._id;
        this.model.findOne({_id: id, deleted: false}).exec().then(doc =>{
            if(!doc){
                res.status(400).send({message: `Not Found`});
            }else{
                let oldDocument = doc.toObject();
                let updatedDocument = _.mergeWith(doc,body,this._customizer);
                updatedDocument = new this.model(updatedDocument);
                updatedDocument.save(function(err,updated){
                    if(err){
                        res.status(400).send({message: err.message});
                    }else{
                        res.status(200).send(updated);
                    }
                });
            }
        }).catch(e=>{
            res.status(400).send({message: e.message});
        });
    },
    _customizer: function(objValue, srcValue) {
        if (_.isArray(objValue)) {
            return srcValue;
        }
    },
    _RegExSerializer: function(exp){
        // If JSON.stringigy is used on object containing RegExp , then it will be replaced with {}. SO in order to avoid it this is the remedy
        Object.defineProperty(RegExp.prototype, "toJSON", {
            value: RegExp.prototype.toString
          });

          if(typeof exp !== 'string') return exp;
          
          // This code below converts the RegExp in string format received from HTTP url back to the RegExp instance type
          var fragments = exp.match(/\/(.*?)\/([a-z]*)?$/i);

          return rehydrated = new RegExp(fragments[1], fragments[2] || '');
    },
    _randomNumber: function(length=16){
        return new Promise((resolve,reject)=>{
            crypto.randomBytes(length, (err, buf) => {
                if (err) {
                    reject(err);
                }
                else{
                    const randomId = buf.toString('hex');
                    resolve(randomId);
                }
            });
        });
    },
    GridFs: function(){
        return new gridFs();
    },
    fs: function(){
        return new FS();
    },

};

gridFs.prototype = {
    // STEP 1: Initialize; --- Call after mongo connection is established Mongo.once();
    init: function(collectionName){
             let gfs = GridFsStream(Mongoose.connection.db, Mongoose.mongo);
             gfs.collection(collectionName);
             return gfs;
        },
    //STEP 2 :  Create storage Engine -- Its a middleware which uploads file to the DB;
    storageEngine: function(mongoUrl,collectionName){
        const storage = new GridFsStorage({
            url: mongoUrl,
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err) {
                    return reject(err);
                    }
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                    filename: filename,
                    bucketName: collectionName,
                    originalname: file.originalname
                    };
                    resolve(fileInfo);
                });
                });
            },
            metadata: function(req,file,cb){
                cb(null,{originalname: file.originalname});
            }
            });
            return upload = multer({ storage });
    },
    findByName: function(gfs){
        gfs.files.findOne({filename: fileName},function(err,file){
            if(err){
                res.status(400).send({message: err.message});
            }else if(file){
                res.status(200).send(file)
            }else{
                res.status(400).send({message: "File Not Found"});
            }
        });
    },
    findAll: function(gfs){
        gfs.files.find().toArray(function(err,doc){
            if(err){
                res.status(400).send({message: err.message})
            }else if(doc){
                res.status(200).send(doc);
            }else{
                res.status(400).send({message: `Not Found`});
            }
        });
    },
    getImageStream: function(gfs){
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
    
}

FS.prototype = {
    /**
     * 
     * @param {*} path 
     * @param {*} options - isSync
     */
    isFolderExists: function(path, options){
        options = options ? options : {isSync: true};

        if(options.isSync){
            try{
                fs.statSync(path);
                return true;
            }catch(e){
                return false;
            }
        }else{
           return new Promise((resolve,reject)=>{
            fs.stat(path, function(err,s){
                if(err) reject(false);
                else resolve(true);
            });
           });
        }
    },
    isFileExists: function(path){
        try{
            fs.statSync(path);
            return true;
        }catch(e){
            return false;
        }
    },
    createFolder: function(path){
        try{
            fs.mkdirSync(path);
            return true;
        }catch(e){
            return false;
        }
    },
    removeFile: function(path){
        try{
            fs.unlinkSync(path);
            return true;
        }catch(e){
            return false;
        }
    },
    readFile: function(path){
        return fs.readFileSync(path, {encoding: "utf8"});
    },
    readFileStream: function(path){
        return fs.createReadStream(path);
    },
    writeFileStream: function(path){
        return fs.createWriteStream(path);
    },
    duplex: function(source,destination){
        let readStream = fs.createReadStream(source);
        let writeStream = fs.createWriteStream(destination);
        readStream.pipe(writeStream);
    }
}

module.exports = Crudder;

