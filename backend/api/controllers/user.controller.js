"use strict;"
const Mongoose = require("mongoose");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const async = require("async");
const http = require("http");
const crypto = require("crypto");
const logger = require("../../logger");
const counter = require("../helpers/counter");
const Crud = require("../helpers/crud");

const userSchema = require("../helpers/user.model");

userSchema.index({firstName: 1, lastName: 1, role: 1, email: 1, password: 1, createdBy: 1});

userSchema.methods.validatePassword = function (password) {
    return (this.password == crypto.createHash("md5").update(password + this.salt).digest("hex"));
};

//userSchema.pre("save", counter.generateId);
userSchema.pre("save", function(next){
    let self = this;
    if(!self._id){
        counter.getCount("user","user","USR", 100,function(err,doc){
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

const crudder = new Crud(null,"user",userSchema,logger);
const userModel = crudder.model;//Mongoose.model("user",userSchema);

function create(req,res){
    var params = req.swagger.params;
    var body = params['data'].value;
    var user = req.user;
    let password = body.password;
    userModel.findOne({email: body.email, role: body.role}).lean().exec().then(doc=>{
        if(doc){
            res.status(400).send({message: 'User already exists !'});
        }else{
            const hashedPassword = generatePassword(password);
            body.salt = hashedPassword.salt;
            body.password = hashedPassword.password;
            body.createdBy = user && user._id ? user._id: "";
            if(req.user && req.user._id) body.createdBy = req.user._id;
            userModel.create(body, (err,user) =>{
                if(err){
                    res.status(400).send({message: "Error occured while creating the new event manager", error: err.message});
                }else if(user){
                    delete user.password;
                    delete user.salt;
                    res.status(200).send(user);
                }
            });
        }
    }).catch(e => {
        res.status(400).send({message: e.message});
    });
}

function generatePassword(password){
    let hashedPassword = null;
    let salt = genRandomString(6);
    hashedPassword = crypto.createHash("md5").update(password + salt).digest("hex");
    return {
        password: hashedPassword,
        salt: salt
    }
}

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

function userIndex(req,res){
    crudder._index(req,res,{resolveReq: true});
}

function getById(req,res){
    const params = req.swagger.params;
    const id = params['id'].value;
    userModel.findOne({_id: id}).lean().exec().then(doc=>{
        if(doc){
            res.status(200).send(doc);
        }else{
            res.status(400).send({message: `Event Manager not found with the Id ${id}`});
        }
    }).catch(e=> res.status(400).send({message: e.message}));
}

function getUserCount(req,res){
    crudder._count(req,res,{resolveReq: true});
}

module.exports = {
    create: create,
    userIndex: userIndex,
    getById: getById,
    getUserCount: getUserCount
}