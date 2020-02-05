"use strict;"

const http = require("http");
const path = require("path");
const bp = require("body-parser");
const proxy = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const app = express();
const port = 7000;

const urls = ['/user'];
const proxies = ['http://localhost:4400/'];

app.use(bp.json());
app.use(bp.urlencoded({extended: true}));
app.use(cors());
app.use(morgan('dev'));

app.use((req,res,next)=>{
    // req.path
    console.log("Original URL is -------", `${req.protocol}://${req.host}${req.originalUrl}`);
    next();
});

app.use('/user', proxy({
    target: proxies[0],
    changeOrigin: true,
    router: proxies[0],
    pathRewrite: {
        "^/user": ""
    }
}));


app.listen(port, ()=>{
    console.log("Proxy Server started on port ", port);
});