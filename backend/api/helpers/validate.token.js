"use strict;"

var Mongoose = require("mongoose");
var jwt = require("jsonwebtoken");


function init(_Mongoose){
    Mongoose = _Mongoose;
}


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
            // Mongoose.models['user'].findOne({email: decoded.email, token: token}).lean().select("_id email token").exec().then(doc=>{
            //     if(doc) resolve({isValid: true, user: decoded});
            //     else reject({isValid: false});
            // }).catch(e => reject(e));
        }).catch(e =>{
            reject(e);
        });
       
    });
}

module.exports = {
    init: init,
    validateToken: validateToken
};