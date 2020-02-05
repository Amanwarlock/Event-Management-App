"use strict;"
const Mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const url = process.env.MONGO_URL;
const logger = require("../../logger");


const loginCtrl = require("./login.controller");
const userCtrl = require("./user.controller");
const assetCtrl = require("./assets.controller");
const eventCtrl = require("./event.controller");
const pdfCtrl = require("../helpers/pdf.generator");

function hearbeat(req,res){
    logger.info("Health check...");
    res.status(200).send({message: 'Working Good'});
}

module.exports = {
    v1_heartbeat: hearbeat,
    v1_createUser: userCtrl.create,
    v1_userIndex: userCtrl.userIndex,
    v1_userById: userCtrl.getById,
    v1_login: loginCtrl.login,
    v1_logOut: loginCtrl.logOut,
    v1_isLoggedIn: loginCtrl.isLoggedIn,
    v1_upload: assetCtrl.upload,
    v1_uploadBase64: assetCtrl.uploadBase64,
    v1_getFile: assetCtrl.getFile,
    v1_getAssetDoc: assetCtrl.getAssetDoc,
    v1_getImage: assetCtrl.getImage,
    v1_getUserCount: userCtrl.getUserCount,
    v1_eventIndex: eventCtrl.eventIndex,
    v1_createEvent: eventCtrl.createEvent,
    v1_getEventCount: eventCtrl.getEventCount,
    v1_getEventById: eventCtrl.getEventById,
    v1_eventUpdate: eventCtrl.eventUpdate,
    v1_downloadGuestPDF: eventCtrl.downloadGuestPDF,
    v1_verifyPassword: loginCtrl.verifyPassword,
    v1_eventUpdate2: eventCtrl.eventUpdate2,
}