"use strict;"

const path = require("path");
const fs = require("fs");
const readline = require("readline");
const jsonexport = require("jsonexport");
const csvjson = require("csvjson");
const csvTojson=require('csvtojson')
const _ = require("lodash");



const Crud = require("./crud");

const crudFS = new Crud().fs();


function toJSON(){
    return new Promise((resolve, reject)=>{

    });
}

function fromCsvToJson(){

}

function fromXLSToJson(){

}

function fromXMLToJson(){
    
}


module.exports = {
    toJSON: toJSON,
}