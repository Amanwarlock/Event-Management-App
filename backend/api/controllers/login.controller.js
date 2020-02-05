"use strict;"
const Mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
var jwt = require("jsonwebtoken");
var md5 = require("md5");
var os = require("os");
var jwtDecode = require('jwt-decode');

const logger = require("../../logger");
const validate = require("../helpers/validate.token");

function login(req,res){
    let params = req.swagger.params;
    let data = params['data'].value;
    let email = data['email'];
    let password = data['password'];
    let role = data['role'];
    Mongoose.models['user'].findOne({
        email: email,
        role: role
    }).exec().then(doc=>{
        if(!doc){
            res.status(400).send({message: 'Invalid email or account does not exist'});
        }else if(doc){
           /**
            * - verify password
            * - Generate JWT token
            * - Save token to db
            * - send response back
            */
            if(doc.validatePassword(password)){
                const token = generateToken(doc);
                doc.token = token;
                doc.save().then(updated=>{
                    delete updated.password;
                    delete updated.salt;
                    res.status(200).send(updated);
                }).catch(e=> res.status(400).send({message: e.message}));
            }else{
                res.status(500).send({message: `Invalid Password`});
            }
        }
    }).catch(e => res.status(400).send({message: e.message}));
}

function generateToken(doc){
    let claim = {
        _id: doc._id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        role: doc.role
    }

    return jwt.sign(claim, process.env.secretKey, { expiresIn: process.env.TOKEN_EXP });
}

function logOut(req,res){
    const params = req.swagger.params['data'].value;
    const _id = params['id'];
    const email = params['email'];
    Mongoose.models['user'].findOneAndUpdate({$or: [{_id: _id}, {email: email}]},{$unset: {token: ""}},{new: true, useFindAndModify: true}).exec().then(doc=>{
        if(doc){
            let user = {
                _id: doc._id,
                email: doc.email,
                token: doc.token
            }
            res.status(200).send(user);
        }else{
            res.status(400).send({message: 'Logging out failed', email: email, id: _id});
        }
    }).catch(e=> res.status(400).send({message: e.message}));
}

function isLoggedIn(req,res){
    const token = req.headers['authentication'];
    validateToken(token).then(data=>{
        res.status(200).send(data);
    }).catch(e=> res.status(403).send({message: `UnAuthorized Access`, isLoggedIn: false}));
}

function validateToken(token){
    return new Promise((resolve,reject)=>{
        // Validate JWT token;
        const jwtPromise = new Promise((resolve,reject)=>{
            jwt.verify(token, process.env.secretKey, function (err, decoded) {
                if (err) {
                  resolve({isValid: false, isLoggedIn: false});
                } else {
                    resolve({isValid: true, isLoggedIn: true, user: decoded});
                }
              });
        });

        jwtPromise.then(data => {
            if(data.isValid){
                Mongoose.models['user'].findOne({email: data.user.email, token: token}).lean().select("_id email token").exec().then(doc=>{
                    if(doc) resolve(data);
                    else {
                        data.isValid = false;
                        data.isLoggedIn = false;
                        delete data.user;
                        resolve(data);
                    }
                }).catch(e => reject(e));
            }else{
                resolve(data);
            }
        }).catch(e =>{
            reject(e);
        });
       
    });
}

function verifyPassword(req,res){
    const params = req.swagger.params;
    const body = params['data'].value;
    const password = body.password;
    Mongoose.models['user'].findOne({ _id: body.id}).exec().then(doc=>{
        if(!doc){
            res.status(200).send({message: 'Invalid User Id, Cannot verify password'});
        }else if(doc){
            if(doc.validatePassword(password)){
                res.status(200).send(true);
            }else{
                res.status(200).send(false);
            }
        }
    }).catch(e => res.status(400).send({message: e.message}));
}

module.exports={
    login: login,
    logOut: logOut,
    isLoggedIn: isLoggedIn,
    verifyPassword: verifyPassword,
}